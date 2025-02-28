<?php

namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

class KeycloakAuthenticator extends AbstractAuthenticator
{
  public function __construct(
    private EntityManagerInterface $entityManager,
    private ParameterBagInterface $parameterBag,
    private TagAwareCacheInterface $cacheApp,
    private UserRepository $userRepository
  ) {}

  /**
   * Called on every request to decide if this authenticator should be
   * used for the request. Returning `false` will cause this authenticator
   * to be skipped.
   */
  public function supports(Request $request): ?bool
  {
    return $request->headers->has('Authorization');
  }

  /**
   * @param Request $request
   *
   * @return Passport
   */
  public function authenticate(Request $request): Passport
  {
    // Get token from header
    $jwtToken = $request->headers->get('Authorization');
    if (false === str_starts_with($jwtToken, 'Bearer ')) {
      throw new AuthenticationException('Invalid token');
    }

    $jwtToken = str_replace('Bearer ', '', $jwtToken);

    // Decode the token
    $parts = explode('.', $jwtToken);
    if (count($parts) !== 3) {
      throw new AuthenticationException('Invalid token');
    }

    $header = json_decode(base64_decode($parts[0]), true);

    // Validate token
    try {
      $decodedToken = JWT::decode($jwtToken, $this->getJwks(), [$header['alg']]);
    } catch (Exception $e) {
      throw new AuthenticationException($e->getMessage());
    }

    return new SelfValidatingPassport(
      new UserBadge($decodedToken->sub, function (string $userId) use ($decodedToken) {
        $user = $this->userRepository->find($userId);
        $roles = $decodedToken->realm_access->roles ?? null;

        if (null === $user) {
          $user = new User($userId);
          $this->entityManager->persist($user);
          if (is_array($roles) && in_array("user", $roles, true)) {
            $user->setRoles(['ROLE_USER']);
          }
          $user->setEmail($decodedToken->email);
          $user->setEmailVerified($decodedToken->email_verified);
          $user->setFirstname($decodedToken->given_name);
          $this->entityManager->flush();
        }

        // if ($user->getRoles() === ['ROLE_USER'] && is_array($roles) && in_array("professional", $roles, true)) {
        //   $user->setRoles(['ROLE_PROFESSIONAL']);
        //   $this->entityManager->persist($user);
        //   $this->entityManager->flush();
        // }

        return $user;
      })
    );
  }

  /**
   * @param Request $request
   * @param TokenInterface $token
   * @param string $firewallName
   *
   * @return Response|null
   */
  public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
  {
    // on success, let the request continue
    return null;
  }

  /**
   * @param Request $request
   * @param AuthenticationException $exception
   *
   * @return Response|null
   */
  public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
  {
    $data = [
      'error' => strtr($exception->getMessageKey(), $exception->getMessageData())
    ];

    return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
  }

  /**
   * @return array
   */
  private function getJwks(): array
  {
    $jwkData = $this->cacheApp->get('jwk_keys', function (ItemInterface $item) {
      $jwkData = json_decode(
        file_get_contents(sprintf(
          '%s/realms/%s/protocol/openid-connect/certs',
          trim($this->parameterBag->get('keycloak_url'), '/'),
          $this->parameterBag->get('keycloak_realm')
        )),
        true
      );

      $item->expiresAfter(3600);
      $item->tag(['authentication']);

      return $jwkData;
    });

    return JWK::parseKeySet($jwkData);
  }
}

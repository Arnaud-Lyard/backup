<?php

namespace App\Controller;

use App\Repository\CompanyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use App\Dto\CreateCompanyDto;
use App\Entity\Company;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class CompanyController extends AbstractController
{
  private string $logosDirectory;

  public function __construct(
    private EntityManagerInterface $entityManager,
    private ParameterBagInterface $parameterBag,
    private HttpClientInterface $client,
    private FileUploader $fileUploader,
  ) {
    $this->logosDirectory = $this->parameterBag->get('logos_directory');
  }


  #[Route('/admin/pending-company/active/{companyid}', name: 'admin_pending_company_active', methods: ['PATCH'])]
  public function activePendingCompany(int $companyid, EntityManagerInterface $entityManagerInterface): JsonResponse
  {
    $company = $entityManagerInterface->getRepository(Company::class)->findOneBy(['id' => $companyid]);
    if ($company === null) {
      return new JsonResponse(['status' => 404, 'message' => "Cet entreprise n'existe pas"], Response::HTTP_NOT_FOUND, [], false);
    }
    $userId = $company->getOwner()->getId();

    $keycloakUrl = $this->parameterBag->get('keycloak_url');
    $keycloakClientId = $this->parameterBag->get('keycloak_client_id');
    $keycloakClientSecret = $this->parameterBag->get('keycloak_client_secret');
    $keycloakRealm = $this->parameterBag->get('keycloak_realm');
    $keycloakMasterRealm = $this->parameterBag->get('keycloak_master_realm');
    $keycloakUsername = $this->parameterBag->get('keycloak_admin_username');
    $keycloakPassword = $this->parameterBag->get('keycloak_admin_password');

    $accessTokenResponse = $this->client->request('POST', "$keycloakUrl/realms/$keycloakMasterRealm/protocol/openid-connect/token", [
      'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
      'body' => [
        'client_id' => $keycloakClientId,
        'grant_type' => 'password',
        'username' => $keycloakUsername,
        'password' => $keycloakPassword
      ],
    ]);

    if ($accessTokenResponse->getStatusCode() !== 200) {
      return new JsonResponse(['status' => 500, 'message' => "Échec de l'authentification"], Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    $data = json_decode($accessTokenResponse->getContent(), true);
    $accessToken = $data['access_token'];

    $roleResponse = $this->client->request('GET', "$keycloakUrl/admin/realms/$keycloakRealm/roles/professional", [
      'headers' => [
        'Authorization' => "Bearer $accessToken",
        'Content-Type' => 'application/json',
      ],
    ]);

    $roleData = json_decode($roleResponse->getContent(), true);
    $roleId = $roleData['id'];

    $assignRoleResponse = $this->client->request('POST', "$keycloakUrl/admin/realms/$keycloakRealm/users/$userId/role-mappings/realm", [
      'headers' => [
        'Authorization' => "Bearer $accessToken",
        'Content-Type' => 'application/json',
      ],
      'json' => [
        [
          'id' => $roleId,
          'name' => 'professional',
        ]
      ],
    ]);

    if ($assignRoleResponse->getStatusCode() !== 204) {
      return new JsonResponse(['status' => 500, 'message' => "Erreur lors de l'ajout du rôle"], Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    $user = $company->getOwner();
    $user->setRoles(['ROLE_PROFESSIONAL']);

    $entityManagerInterface->persist($user);
    $entityManagerInterface->flush();

    return new JsonResponse(['status' => 200, 'message' => "Changement du statut de l'entreprise' effectuée"], Response::HTTP_OK, [], false);
  }

  #[Route('/admin/pending-companies', name: 'admin_pending_companies_list', methods: ['GET'])]
  public function pendingCompaniesList(EntityManagerInterface $entityManagerInterface, SerializerInterface $serializer): JsonResponse
  {
    $qb = $entityManagerInterface->createQueryBuilder();

    $qb->select('c')
      ->from(Company::class, 'c')
      ->innerJoin('c.owner', 'u')
      ->where("u.roles LIKE :role")
      ->setParameter('role', '%ROLE_USER%');

    $companies = $qb->getQuery()->getResult();
    $jsonPendingCompanies = $serializer->serialize($companies, 'json', ['groups' => 'getPendingCompanies']);
    return new JsonResponse($jsonPendingCompanies, Response::HTTP_OK, [], true);
  }

  #[Route('/professional/company/edit', name: 'professional_company_edit', methods: ['POST'])]
  public function editCompany(#[MapRequestPayload()] CreateCompanyDto $createCompany, EntityManagerInterface $entityManagerInterface, Request $request, Filesystem $filesystem): JsonResponse
  {
    $user = $this->getUser();

    $company = $user->getCompany();
    $company->setName($createCompany->companyname);
    $company->setDescription($createCompany->description);
    $company->setAddress($createCompany->address);
    $company->setOwner($user);

    $logo = $request->files->get('logo');

    if ($logo) {
      $filesystem->remove($this->logosDirectory . '/' . $company->getLogo());
      $logoFileName = $this->fileUploader->upload($logo);
      $company->setLogo($logoFileName);
    }

    $entityManagerInterface->persist($company);
    $entityManagerInterface->flush();

    return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
  }

  #[Route('/professional/company/get', name: 'professional_company_get', methods: ['GET'])]
  public function getCompany(SerializerInterface $serializer): JsonResponse
  {
    $user = $this->getUser();
    $company = $user->getCompany();

    if ($company === null) {
      return new JsonResponse(['status' => 200, 'message' => "En attente de création de l'entreprise"], Response::HTTP_OK, [], false);
    }

    $jsonCompany = $serializer->serialize($company, 'json', ['groups' => 'getCompany']);
    return new JsonResponse($jsonCompany, Response::HTTP_OK, [], true);
  }
}

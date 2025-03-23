<?php

namespace App\Controller;

use App\Dto\CreateTestimonialDto;
use App\Entity\Testimonial;
use App\Service\FileUploader;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

final class TestimonialController extends AbstractController
{

    #[Route('/testimonial', name: 'testimonial_list', methods: ['GET'])]
    public function testimonialsList(EntityManagerInterface $entityManagerInterface, SerializerInterface $serializer): JsonResponse
    {
        $testimonials = $entityManagerInterface->getRepository(Testimonial::class)->findBy(['isActive' => true], ['createdAt' => 'DESC'], 2);
        $jsonTestimonials = $serializer->serialize($testimonials, 'json', ['groups' => 'getTestimonials']);
        return new JsonResponse($jsonTestimonials, Response::HTTP_OK, [], true);
    }

    #[Route('/admin/testimonial/active/{testimonialid}', name: 'admin_testimonial_active', methods: ['PATCH'])]
    public function activeTestimonial(int $testimonialid, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $testimonial = $entityManagerInterface->getRepository(Testimonial::class)->findOneBy(['id' => $testimonialid]);
        if ($testimonial === null) {
            return new JsonResponse(['status' => 404, 'message' => "Cet avis n'existe pas"], Response::HTTP_NOT_FOUND, [], false);
        }
        if ($testimonial->isActive() === true) {
            $testimonial->setIsActive(false);
        } else {
            $testimonial->setIsActive(true);
        }
        $entityManagerInterface->persist($testimonial);
        $entityManagerInterface->flush();

        return new JsonResponse(['status' => 200, 'message' => "Changement du statut de la revue effectuée"], Response::HTTP_OK, [], false);
    }

    #[Route('/admin/testimonials', name: 'admin_testimonials_list', methods: ['GET'])]
    public function adminTestimonialsList(EntityManagerInterface $entityManagerInterface, SerializerInterface $serializer): JsonResponse
    {
        $testimonials = $entityManagerInterface->getRepository(Testimonial::class)->findAll();
        $jsonTestimonials = $serializer->serialize($testimonials, 'json', ['groups' => 'getTestimonials']);
        return new JsonResponse($jsonTestimonials, Response::HTTP_OK, [], true);
    }

    #[Route('/professional/testimonial/post', name: 'professional_testimonial_post')]
    public function postTestimonial(#[MapRequestPayload()] CreateTestimonialDto $createTestimonial, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();

        if ($user->getTestimonial() === null) {
            $testimonial = new Testimonial();
            $testimonial->setDescription($createTestimonial->description);
            $testimonial->setRating($createTestimonial->rating);
            $testimonial->setIsActive(0);
            $testimonial->setOwner($user);
            $creationDate = new DateTimeImmutable('now', (new DateTimeZone('Europe/Paris')));
            $testimonial->setCreatedAt($creationDate);
            $entityManagerInterface->persist($testimonial);
            $entityManagerInterface->flush();
            return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
        }
        return new JsonResponse(['status' => 409, 'message' => "Vous ne pouvez soumettre qu'un seul avis."], Response::HTTP_CONFLICT);
    }
}

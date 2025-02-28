<?php

namespace App\Controller;

use App\Dto\CreateTestimonialDto;
use App\Entity\Testimonial;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/testimonial', name: 'testimonial_')]
final class TestimonialController extends AbstractController
{
    #[Route('/', name: 'list', methods: ['GET'])]
    public function testimonialsList(EntityManagerInterface $entityManagerInterface, SerializerInterface $serializer): JsonResponse
    {
        $testimonials = $entityManagerInterface->getRepository(Testimonial::class)->findBy(['isActive' => true], ['createdAt' => 'DESC'], 2);
        $jsonTestimonials = $serializer->serialize($testimonials, 'json', ['groups' => 'getTestimonials']);
        return new JsonResponse($jsonTestimonials, Response::HTTP_OK, [], true);
    }
}

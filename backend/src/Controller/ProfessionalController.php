<?php

namespace App\Controller;

use App\Dto\CreateCompanyDto;
use App\Dto\CreateTestimonialDto;
use App\Entity\Company;
use App\Entity\Testimonial;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\FileUploader;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[Route('/professional', name: 'professional_')]
final class ProfessionalController extends AbstractController
{
    private string $logosDirectory;
    private FileUploader $fileUploader;

    public function __construct(ParameterBagInterface $params,  FileUploader $fileUploader)
    {
        $this->logosDirectory = $params->get('logos_directory');
        $this->fileUploader = $fileUploader;
    }

    #[Route('/company/edit', name: 'company_edit', methods: ['POST'])]
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

    #[Route('/company/get', name: 'company_get', methods: ['GET'])]
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

    #[Route('/testimonial/post', name: 'testimonial_post')]
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

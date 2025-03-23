<?php

namespace App\Controller;

use App\Dto\NewUnavailabilityDto;
use App\Entity\UnAvailability;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

final class UnAvailabilityController extends AbstractController
{
    #[Route('/professional/unavailability/new', name: 'professional_unavailability_new')]
    public function newUnavailability(#[MapRequestPayload()] NewUnavailabilityDto $newUnAvailability, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();
        $unAvailability = new UnAvailability();
        $unAvailability->setCompany($company);
        $unAvailability->setBeginDate(new \DateTime($newUnAvailability->beginDate));
        $unAvailability->setEndDate(new \DateTime($newUnAvailability->endDate));
        $entityManagerInterface->persist($unAvailability);
        $entityManagerInterface->flush();
        return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
    }

    #[Route('/professional/unavailability/edit/{id}', name: 'professional_unavailability_edit')]
    public function editUnavailability(#[MapRequestPayload()] NewUnavailabilityDto $newUnAvailability, EntityManagerInterface $entityManagerInterface, int $id): JsonResponse
    {
        $user = $this->getUser();
        $unAvailability = $entityManagerInterface->getRepository(UnAvailability::class)->findOneBy(['id' => $id]);
        $unAvailability->setBeginDate(new \DateTime($newUnAvailability->beginDate));
        $unAvailability->setEndDate(new \DateTime($newUnAvailability->endDate));
        $entityManagerInterface->persist($unAvailability);
        $entityManagerInterface->flush();
        return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
    }

    #[Route('/professional/unavailabilities/list', name: 'professional_unavailabilities_list')]
    public function unavailabilitiesList(SerializerInterface $serializer): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();
        $unavailabilities = $company->getUnavailabilities();
        $jsonUnavailabilities = $serializer->serialize($unavailabilities, 'json', ['groups' => 'getUnavailabilities']);
        return new JsonResponse($jsonUnavailabilities, Response::HTTP_OK, [], true);
    }
}

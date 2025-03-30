<?php

namespace App\Controller;

use App\Dto\CloseAvailabilityDto;
use App\Dto\CreateAvailabilityDto;
use App\Dto\DeleteAvailabilityDto;
use App\Dto\OpenAvailabilityDto;
use App\Entity\Availability;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class AvailabilityController extends AbstractController
{
    #[Route('/professional/availability/new', name: 'professional_availability_new', methods: ['POST'])]
    public function new(#[MapRequestPayload()] CreateAvailabilityDto $createAvailability, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();

        $startTime = (new \DateTime($createAvailability->startTime))->format('H:i:s');
        $endTime = (new \DateTime($createAvailability->endTime))->format('H:i:s');

        $existingAvailability = $entityManagerInterface->getRepository(Availability::class)
            ->createQueryBuilder('a')
            ->where('a.company = :company')
            ->andWhere('a.day = :day')
            ->andWhere('(:start_time BETWEEN a.start_time AND a.end_time OR :end_time BETWEEN a.start_time AND a.end_time)')
            ->setParameter('company', $company)
            ->setParameter('day', $createAvailability->day)
            ->setParameter('start_time', $startTime)
            ->setParameter('end_time', $endTime)
            ->getQuery()
            ->getResult();

        if ($existingAvailability) {
            return new JsonResponse([
                "violations" => [
                    [
                        "propertyPath" => "startTime",
                        "message" => "Ce créneau chevauche un autre."
                    ]
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $availability = new Availability();
        $availability->setDay($createAvailability->day);
        $availability->setStartTime(new \DateTime($createAvailability->startTime));
        $availability->setEndTime(new \DateTime($createAvailability->endTime));
        $availability->setCompany($company);
        $availability->setIsClosed(false);

        $entityManagerInterface->persist($availability);
        $entityManagerInterface->flush();

        return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
    }

    #[Route('/professional/availabilities/list', name: 'professional_availabilities_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();

        $availabilities = $entityManagerInterface->getRepository(Availability::class)
            ->findBy(['company' => $company]);

        $weekAvailability = [
            'Lundi'    => [],
            'Mardi'   => [],
            'Mercredi' => [],
            'Jeudi'  => [],
            'Vendredi'    => [],
            'Samedi'  => [],
            'Dimanche'    => []
        ];

        foreach ($availabilities as $availability) {
            $dayOfWeek = $availability->getDay();

            $startTimeExist = $availability->getStartTime();
            $endTimeExist = $availability->getEndTime();
            $isClosed = $availability->isClosed();

            if (isset($startTimeExist) && isset($endTimeExist)) {
                $startTime = $availability->getStartTime()->format('H:i');
                $endTime = $availability->getEndTime()->format('H:i');
                $weekAvailability[$dayOfWeek][] = [
                    'id'    => $availability->getId(),
                    'start' => $startTime,
                    'end'   => $endTime
                ];
            }
            if ($isClosed === true) {
                $weekAvailability[$dayOfWeek][] = [
                    'closed' => true
                ];
            }
        }

        return new JsonResponse($weekAvailability);
    }

    #[Route('/professional/availability/close', name: 'professional_availability_closed', methods: ['POST'])]
    public function close(#[MapRequestPayload()] CloseAvailabilityDto $closeAvailability, Request $request, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();

        $availabilities = $company->getAvailabilities();

        foreach ($availabilities as $availability) {
            $day = $availability->getDay();
            if ($day === $closeAvailability->day) {
                $company->removeAvailability($availability);
                $entityManagerInterface->remove($availability);
            }
        }
        $availability = new Availability();
        $availability->setDay($closeAvailability->day);
        $availability->setIsClosed(true);
        $availability->setCompany($company);
        $entityManagerInterface->persist($availability);
        $entityManagerInterface->flush();

        return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
    }

    #[Route('/professional/availability/open', name: 'professional_availability_open', methods: ['POST'])]
    public function open(#[MapRequestPayload()] OpenAvailabilityDto $openAvailability, Request $request, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();

        $availabilities = $company->getAvailabilities();

        foreach ($availabilities as $availability) {
            $day = $availability->getDay();
            if ($day === $openAvailability->day) {
                $company->removeAvailability($availability);
                $entityManagerInterface->remove($availability);
            }
        }
        $entityManagerInterface->flush();

        return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
    }

    #[Route('/professional/availability/delete', name: 'professional_availability_delete', methods: ['DELETE'])]
    public function delete(#[MapRequestPayload()] DeleteAvailabilityDto $deleteAvailability, Request $request, EntityManagerInterface $entityManagerInterface): JsonResponse
    {
        $user = $this->getUser();
        $company = $user->getCompany();
        $availability = $entityManagerInterface->getRepository(Availability::class)->findOneBy(['id' => $deleteAvailability->id]);
        $entityManagerInterface->remove($availability);
        $entityManagerInterface->flush();

        return new JsonResponse(['status' => 200, 'message' => 'Ressource deleted successfully'], Response::HTTP_CREATED);
    }
}

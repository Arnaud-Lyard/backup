<?php

namespace App\Controller;

use App\Dto\CreateCompanyDto;
use App\Entity\Company;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/user', name: 'user_')]
final class UserController extends AbstractController
{
    #[Route('/onboarding', name: 'onboarding')]
    public function onBoarding(#[MapRequestPayload()] CreateCompanyDto $createCompany, EntityManagerInterface $entityManagerInterface, Request $request, ValidatorInterface $validator, FileUploader $fileUploader): JsonResponse
    {
        $user = $this->getUser();
        if ($user->getCompany() !== NULL) {
            return new JsonResponse(['status' => 409, 'message' => "Vous ne pouvez enregistrer qu'une seule entreprise."], Response::HTTP_CONFLICT);
        }
        $logo = $request->files->get('logo');
        $createCompany->logo = $logo;

        $errors = $validator->validate($createCompany);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['status' => 400, 'message' => implode(', ', $errorMessages)], Response::HTTP_BAD_REQUEST);
        }

        $logoFileName = $fileUploader->upload($logo);

        $company = new Company();

        $company->setName($createCompany->companyname);
        $company->setDescription($createCompany->description);
        $company->setAddress($createCompany->address);
        $company->setOwner($user);
        $company->setLogo($logoFileName);

        $entityManagerInterface->persist($company);
        $entityManagerInterface->flush();

        return new JsonResponse(['status' => 200, 'message' => 'success'], Response::HTTP_CREATED);
    }
}

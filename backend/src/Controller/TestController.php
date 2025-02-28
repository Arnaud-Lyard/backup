<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class TestController extends AbstractController
{
    #[Route('/api/test', name: 'app_test')]
    public function index(): Response
    {
        return $this->render('templates/company/index.html.twig');
    }
    #[Route('/api/professional', name: 'app_professional')]
    public function professional(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to your professional controller!',
            'path' => 'src/Controller/TestController.php',
        ]);
    }
}

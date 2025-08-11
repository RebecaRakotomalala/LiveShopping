<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\CategoryRepository;
use App\Repository\SaleRepository;
use App\Repository\UsersRepository;
use App\Entity\Users;
use App\Entity\Live;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class ClientController extends AbstractController
{
    #[Route('/client', name: 'app_client')]
    public function index(Request $request,
        CategoryRepository $categoryRepository,
        UsersRepository $usersRepository,
        SaleRepository $saleRepository
    ): Response
    {
        $session = $request->getSession();
        $userSession = $session->get('user');

        if (!$userSession || !isset($userSession['id'])) {
            return $this->redirectToRoute('app_connection');
        }

        $user = $usersRepository->find($userSession['id']);
        if (!$user) {
            return $this->redirectToRoute('app_connection');
        }

        // Données mock pour l'affichage des lives (à remplacer plus tard par des données réelles)
        $lives = [
            [
                'id' => 1,
                'title' => 'Découverte Nouveautés',
                'thumbnail' => '/uploads/6891e6164b5d5.jpg',
                'language' => 'FR',
                'viewers' => 200,
                'username' => 'Username',
            ],
            [
                'id' => 2,
                'title' => 'Collection Automne',
                'thumbnail' => '/uploads/6891f6e39d5a3.jpg',
                'language' => 'FR',
                'viewers' => 200,
                'username' => 'Username',
            ],
            [
                'id' => 3,
                'title' => 'Bonnes affaires',
                'thumbnail' => '/uploads/6891e6164b5d5.jpg',
                'language' => 'FR',
                'viewers' => 200,
                'username' => 'Username',
            ],
            [
                'id' => 4,
                'title' => 'Découverte Nouveautés',
                'thumbnail' => '/uploads/6891f6e39d5a3.jpg',
                'language' => 'FR',
                'viewers' => 200,
                'username' => 'Username',
            ],
            [
                'id' => 5,
                'title' => 'Collection Automne',
                'thumbnail' => '/uploads/6891e6164b5d5.jpg',
                'language' => 'FR',
                'viewers' => 200,
                'username' => 'Username',
            ],
            [
                'id' => 6,
                'title' => 'Bonnes affaires',
                'thumbnail' => '/uploads/6891f6e39d5a3.jpg',
                'language' => 'FR',
                'viewers' => 200,
                'username' => 'Username',
            ],
        ];

        return $this->render('client/index.html.twig', [
            'userId' => $user->getId(),
            'user' => $user,
            'followedLives' => $lives,
            'recommendedLives' => $lives,
        ]);
    }
}
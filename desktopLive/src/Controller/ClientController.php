<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\CategoryRepository;
use App\Repository\SaleRepository;
use App\Repository\LiveRepository;
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
        SaleRepository $saleRepository,
        LiveRepository $liveRepository
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

        // Lives en cours depuis la base (endLive IS NULL)
        $ongoingLives = $liveRepository->findOnGoingLives();

        // Map vers une structure simple attendue par le template
        $lives = array_map(function($live) {
            /** @var \App\Entity\Live $live */
            $seller = $live->getSeller();
            return [
                'id' => $live->getId(),
                'title' => 'Live en cours',
                'thumbnail' => '/uploads/' . ($seller && $seller->getImages() ? $seller->getImages() : '6891e6164b5d5.jpg'),
                'language' => 'FR',
                'viewers' => 200,
                'username' => $seller ? $seller->getUsername() : 'Username',
            ];
        }, $ongoingLives);

        return $this->render('client/index.html.twig', [
            'userId' => $user->getId(),
            'user' => $user,
            'followedLives' => $lives,
            'recommendedLives' => $lives,
        ]);
    }

    #[Route('/client/live/{id}', name: 'app_client_live')]
    public function live(Request $request, UsersRepository $usersRepository, LiveRepository $liveRepository, int $id): Response
    {
        $session = $request->getSession();
        $userSession = $session->get('user');
        $currentUser = null;
        if ($userSession && isset($userSession['id'])) {
            $currentUser = $usersRepository->find($userSession['id']);
        }

        $live = $liveRepository->find($id);
        if (!$live || $live->getEndLive() !== null) {
            return $this->redirectToRoute('app_client');
        }

        return $this->render('client/live.html.twig', [
            'user' => $currentUser,
            'live' => $live,
        ]);
    }
}
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
use App\Repository\LiveRepository;

class ClientController extends AbstractController
{
    #[Route('/client', name: 'app_client')]
    public function index(
        Request $request,
        CategoryRepository $categoryRepository,
        UsersRepository $usersRepository,
        SaleRepository $saleRepository,
        LiveRepository $liveRepository
    ): Response {
        $session = $request->getSession();
        $user = $session->get('user');

        // Récupérer les lives actifs
        $activeLives = $liveRepository->findActiveLives();

        return $this->render('client/index.html.twig', [
            'userId' => $user->getId(),
            'lives' => $activeLives,
        ]);
    }
}

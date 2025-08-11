<?php

namespace App\Controller;

use App\Entity\Live;
use App\Repository\CategoryRepository;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminController extends AbstractController
{
    #[Route('/dashboard', name: 'app_dashboard')]
    public function index(
        Request $request,
        CategoryRepository $categoryRepository,
        UsersRepository $usersRepository
    ): Response {
        // Valeurs par défaut simples (éviter erreurs Twig)
        $defaultStart = new \DateTime('first day of January this year');
        $defaultEnd = new \DateTime('last day of December this year');

        $dateD = $request->request->get('dateD') ? new \DateTime($request->request->get('dateD')) : $defaultStart;
        $dateF = $request->request->get('dateF') ? new \DateTime($request->request->get('dateF')) : $defaultEnd;
        $categoryId = $request->request->get('category') ?: 1;

        // Récupération user depuis session (stocké en tableau)
        $session = $request->getSession();
        $userSession = $session->get('user');
        $defaultSeller = null;
        if ($userSession && isset($userSession['id'])) {
            $defaultSeller = $usersRepository->find($userSession['id']);
        }

        // Jeux de données par défaut (à remplacer par de vraies stats si dispo)
        $stats = [ 'labels' => [], 'chiffre_affaires' => [] ];
        $ventesParCategorieParMois = [ 'labels' => [], 'datasets' => [] ];
        $ventesParArticle = [ 'datasets' => [] ];
        $bestSellers = [];

        return $this->render('admin/index.html.twig', [
            'categories' => $categoryRepository->findAll(),
            'category' => $categoryRepository->find($categoryId),
            'stats' => $stats,
            'ventesParCategorieParMois' => $ventesParCategorieParMois,
            'ventesParArticle' => $ventesParArticle,
            'start' => $dateD->format('Y-m-d'),
            'end' => $dateF->format('Y-m-d'),
            'defaultSeller' => $defaultSeller,
            'bestSellers' => $bestSellers,
        ]);
    }

    #[Route('/liveStart', name: 'admin_live_start')]
    public function startLive(Request $request, EntityManagerInterface $em, UsersRepository $usersRepository): Response
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

        $activeLive = $em->getRepository(Live::class)->findOneBy([
            'seller' => $user,
            'endLive' => null,
        ]);
        if ($activeLive) {
            $this->addFlash('warning', 'Un live est déjà en cours.');
            return $this->redirectToRoute('app_live');
        }

        $live = new Live();
        $live->setStartLive(new \DateTime());
        $live->setSeller($user);
        $em->persist($live);
        $em->flush();

        return $this->redirectToRoute('app_live');
    }

    #[Route('/stopLive/{id}', name: 'admin_live_stop')]
    public function stopLive(Request $request, Live $live, EntityManagerInterface $em, UsersRepository $usersRepository): Response
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

        if ($live->getSeller()->getId() !== $user->getId()) {
            throw $this->createNotFoundException('Vous ne pouvez pas arrêter ce live.');
        }

        $live->setEndLive(new \DateTime());
        $em->flush();

        $this->addFlash('success', 'Le live a été terminé avec succès.');
        return $this->redirectToRoute('app_dashboard');
    }

    #[Route('/enDirecte', name: 'app_live')]
    public function liveInterface(Request $request, EntityManagerInterface $em, UsersRepository $usersRepository): Response
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

        $activeLive = $em->getRepository(Live::class)->findOneBy([
            'seller' => $user,
            'endLive' => null,
        ]);

        return $this->render('admin/live.html.twig', [
            'live' => $activeLive,
            'seller' => $user,
        ]);
    }
}

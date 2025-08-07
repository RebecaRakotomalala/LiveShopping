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

class AdminController extends AbstractController
{
    public function __construct(
        private SaleRepository $saleRepository,
        private UsersRepository $userRepository
    ) {}

    #[Route('/dashboard', name: 'app_dashboard')]
    public function index(
        Request $request,
        CategoryRepository $categoryRepository,
        UsersRepository $usersRepository,
        SaleRepository $saleRepository
    ): Response {
        // 📌 Valeurs par défaut
        $defaultStart = new \DateTime('first day of January this year');
        $defaultEnd = new \DateTime('last day of December this year');

        // 📌 Récupérer les valeurs du formulaire
        $dateD = $request->request->get('dateD') ? new \DateTime($request->request->get('dateD')) : $defaultStart;
        $dateF = $request->request->get('dateF') ? new \DateTime($request->request->get('dateF')) : $defaultEnd;
        $categoryId = $request->request->get('category');

        // 📌 Vendeur par défaut
        $session = $request->getSession();
        $defaultSeller = $session->get('user');

        if (!$defaultSeller || !$defaultSeller instanceof \App\Entity\Users) {
            throw $this->createNotFoundException('Aucun utilisateur connecté trouvé dans la session');
        }
        $defaultSeller = $usersRepository->find($defaultSeller->getId());
        if($categoryId == null)
        {
            $categoryId = 1;
        }

        // 📊 Statistiques globales
        $stats = $saleRepository->getStatistiquesVendeur($dateD, $dateF, $defaultSeller->getId());
        $ventesParCategorieParMois = $saleRepository->getVentesVendeurParCategorieParMois(
            $dateD,
            $dateF,
            $defaultSeller->getId()
        );
        $ventesParArticle = $saleRepository->getVentesParArticlePourCategorie(
            $dateD,
            $dateF,
            $defaultSeller->getId(),
            $categoryId
        );
        $bestSeller = $saleRepository->getTopArticlesVendeur(
            $dateD,
            $dateF,
            $defaultSeller->getId(),
            3
        );

        return $this->render('admin/index.html.twig', [
            'categories' => $categoryRepository->findAll(),
            'category' => $categoryRepository->find($categoryId),
            'stats' => $stats,
            'ventesParCategorieParMois' => $ventesParCategorieParMois,
            'ventesParArticle' => $ventesParArticle,
            'start' => $dateD->format('Y-m-d'),
            'end' => $dateF->format('Y-m-d'),
            'defaultSeller' => $defaultSeller,
            'bestSellers' => $bestSeller ?? null
        ]);
    }

    #[Route('/api/dashboard', name: 'api_dashboard', methods: ['POST'])]
    public function apiDashboard(
        Request $request,
        CategoryRepository $categoryRepository,
        UsersRepository $usersRepository,
        SaleRepository $saleRepository
    ): JsonResponse {
        // Valeurs par défaut
        $defaultStart = new \DateTime('first day of January this year');
        $defaultEnd = new \DateTime('last day of December this year');

        // Récupérer les paramètres GET
        $data = json_decode($request->getContent(), true);

        $dateD = isset($data['dateD']) ? new \DateTime($data['dateD']) : $defaultStart;
        $dateF = isset($data['dateF']) ? new \DateTime($data['dateF']) : $defaultEnd;
        $categoryId = $data['category'] ?? 1;


        // Vendeur connecté via session
        $session = $request->getSession();
        $defaultSeller = $session->get('user');

        if (!$defaultSeller || !$defaultSeller instanceof \App\Entity\Users) {
            return new JsonResponse(['error' => 'Aucun utilisateur connecté'], 401);
        }

        $defaultSeller = $usersRepository->find($defaultSeller->getId());
        // $defaultSeller = $usersRepository->find(1);


        // Statistiques et données
        $stats = $saleRepository->getStatistiquesVendeur($dateD, $dateF, $defaultSeller->getId());
        $ventesParCategorieParMois = $saleRepository->getVentesVendeurParCategorieParMois($dateD, $dateF, $defaultSeller->getId());
        $ventesParArticle = $saleRepository->getVentesParArticlePourCategorie($dateD, $dateF, $defaultSeller->getId(), $categoryId);
        $bestSeller = $saleRepository->getTopArticlesVendeur($dateD, $dateF, $defaultSeller->getId(), 3);

        // Optionnel : transformer objets Doctrine si besoin

        return new JsonResponse([
            'dates' => [
                'start' => $dateD->format('Y-m-d'),
                'end' => $dateF->format('Y-m-d')
            ],
            'stats' => $stats,
            'ventesParCategorieParMois' => $ventesParCategorieParMois,
            'ventesParArticle' => $ventesParArticle,
            'categories' => $categoryRepository->findAll(),
            'category' => $categoryRepository->find($categoryId),
            'seller' => [
                'id' => $defaultSeller->getId(),
                'username' => $defaultSeller->getUsername(),
            ],
            'bestSellers' => $bestSeller ?? null
        ]);
    }

    #[Route('/liveStart', name: 'admin_live_start')]
    public function startLive(Request $request, EntityManagerInterface $em, UsersRepository $usersRepository): Response
    {
        $session = $request->getSession();
        $user = $session->get('user');
        $userID = $usersRepository->find($user->getId());
        $user = $usersRepository->find($userID);

        // Vérifie si un live est déjà actif
        $activeLive = $em->getRepository(Live::class)->findOneBy([
            'seller' => $user,
            'endLive' => null
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
        $user = $session->get('user');
        $userID = $usersRepository->find($user->getId());
        $user = $usersRepository->find($userID);

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
        $user = $session->get('user');
        $userID = $usersRepository->find($user->getId());
        $user = $usersRepository->find($userID);

        $activeLive = $em->getRepository(Live::class)->findOneBy([
            'seller' => $user,
            'endLive' => null
        ]);

        return $this->render('admin/live.html.twig', [
            'live' => $activeLive,
            'seller' => $user,
        ]);
    }
}

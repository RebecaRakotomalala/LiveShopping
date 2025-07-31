<?php

namespace App\Controller;

use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

final class ProfilClientController extends AbstractController
{
    #[Route('/client/profil', name: 'app_client_profil')]
    public function profil(Request $request, EntityManagerInterface $em): Response
    {
        // Récupérer l'utilisateur connecté depuis la session
        $session = $request->getSession();
        $userSession = $session->get('user');
        
        if (!$userSession) {
            return $this->redirectToRoute('app_connection');
        }
        
        /** @var Users $user */
        $user = $em->getRepository(Users::class)->find($userSession['id']);
        
        if (!$user) {
            throw $this->createNotFoundException('Utilisateur non trouvé');
        }
        
        return $this->render('client/profil.html.twig', [
            'user' => $user,
        ]);
    }
    
    #[Route('/client/profil/update', name: 'app_client_update_profile', methods: ['POST'])]
    public function updateProfil(
        Request $request,
        EntityManagerInterface $em
    ): Response {
        // Vérifier que l'utilisateur est connecté
        $session = $request->getSession();
        $userSession = $session->get('user');
        
        if (!$userSession) {
            return $this->redirectToRoute('app_connection');
        }
        
        /** @var Users $user */
        $user = $em->getRepository(Users::class)->find($userSession['id']);
        
        if (!$user) {
            throw $this->createNotFoundException('Utilisateur non trouvé');
        }
        
        // Traitement du formulaire
        $username = $request->request->get('username');
        $email = $request->request->get('email');
        $address = $request->request->get('address');
        $country = $request->request->get('country');
        $contact = $request->request->get('contact');
        
        // Validation basique (vous pouvez ajouter plus de validations)
        if (empty($username)) {
            $this->addFlash('error', 'Le nom d\'utilisateur ne peut pas être vide');
            return $this->redirectToRoute('app_client_profil');
        }
        
        if (empty($email)) {
            $this->addFlash('error', 'L\'email ne peut pas être vide');
            return $this->redirectToRoute('app_client_profil');
        }
        
        // Mise à jour des informations
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setAddress($address);
        $user->setCountry($country);
        $user->setContact($contact);
        
        $em->flush();
        
        // Mettre à jour la session si le username a changé
        $userSession['username'] = $username;
        $session->set('user', $userSession);
        
        $this->addFlash('success', 'Profil mis à jour avec succès');
        return $this->redirectToRoute('app_client_profil');
    }
    
    #[Route('/api/client/profil', name: 'api_client_profil', methods: ['GET'])]
    public function apiProfil(Request $request, EntityManagerInterface $em): Response
    {
        $session = $request->getSession();
        $userSession = $session->get('user');
        
        if (!$userSession) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }
        
        /** @var Users $user */
        $user = $em->getRepository(Users::class)->find($userSession['id']);
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        
        return $this->json([
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'address' => $user->getAddress(),
            'country' => $user->getCountry(),
            'contact' => $user->getContact(),
        ]);
    }
    
    #[Route('/api/client/profil/update', name: 'api_client_update_profile', methods: ['POST'])]
    public function apiUpdateProfil(Request $request, EntityManagerInterface $em): Response
    {
        $session = $request->getSession();
        $userSession = $session->get('user');
        
        if (!$userSession) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Données JSON invalides'], 400);
        }
        
        /** @var Users $user */
        $user = $em->getRepository(Users::class)->find($userSession['id']);
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        
        // Validation
        if (empty($data['username'])) {
            return $this->json(['error' => 'Le nom d\'utilisateur est requis'], 400);
        }
        
        if (empty($data['email'])) {
            return $this->json(['error' => 'L\'email est requis'], 400);
        }
        
        // Mise à jour
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $user->setAddress($data['address'] ?? null);
        $user->setCountry($data['country'] ?? null);
        $user->setContact($data['contact'] ?? null);
        
        $em->flush();
        
        // Mettre à jour la session
        $userSession['username'] = $data['username'];
        $session->set('user', $userSession);
        
        return $this->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'address' => $user->getAddress(),
                'country' => $user->getCountry(),
                'contact' => $user->getContact(),
            ]
        ]);
    }
}
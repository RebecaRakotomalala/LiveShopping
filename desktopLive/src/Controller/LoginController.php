<?php

namespace App\Controller;

use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class LoginController extends AbstractController
{
    #[Route('/login', name: 'app_login')]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): Response {
        $error = null;

        if ($request->isMethod('POST')) {
            $username = $request->request->get('username');
            $password = $request->request->get('password');

            /** @var Users|null $user */
            $user = $em->getRepository(Users::class)->findOneBy(['username' => $username]);

            if (!$user) {
                $error = 'Nom d’utilisateur invalide.';
            } else {
                // Debugging ici
                dump('Mot de passe saisi : ' . $password);
                dump('Hash en base : ' . $user->getPassword());
                dump('Est valide ? ', $hasher->isPasswordValid($user, $password));

                if (!$hasher->isPasswordValid($user, $password)) {
                    $error = 'Mot de passe incorrect.';
                } else {
                    // Authentification réussie : stocker les infos utilisateur dans la session
                    $session = $request->getSession();
                    $session->set('user', [
                        'id' => $user->getId(),
                        'username' => $user->getUsername(),
                        'is_seller' => $user->getIsSeller(),
                    ]);

                    $this->addFlash('success', 'Connexion réussie !');
                    return $this->redirectToRoute('app_home'); // à adapter
                }
            }
        }

        return $this->render('login/index.html.twig', [
            'error' => $error,
        ]);
    }
}
<?php

namespace App\Form;

use App\Entity\Users;
use App\Service\CountryService;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;

class InscriptionFormType extends AbstractType
{
    public function __construct(private CountryService $countryService) {}

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $countries = $this->countryService->getCountries();
        $countryChoices = array_combine($countries, $countries);

        $builder
            ->add('email')
            ->add('username')
            ->add('contact')
            ->add('address')
            ->add('country', ChoiceType::class, [
                'choices' => $countryChoices,
                'placeholder' => 'Choisissez un pays',
            ])
            ->add('plainPassword', PasswordType::class, [
                'mapped' => false,
                'constraints' => [
                    new NotBlank(['message' => 'Entrez un mot de passe']),
                    new Length([
                        'min' => 6,
                        'minMessage' => 'Le mot de passe doit contenir au moins {{ limit }} caractères',
                        'max' => 4096,
                    ]),
                ],
            ])
            ->add('isSeller', CheckboxType::class, [
                'required' => false,
                'label' => 'Vendeur ?'
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Users::class,
        ]);
    }
}

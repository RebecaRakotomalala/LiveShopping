<?php

namespace App\Entity;

use App\Repository\ItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ItemRepository::class)]
class Item
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_item')]
    private ?int $id = null;

    #[ORM\Column(name: 'name_item', length: 255)]
    private ?string $nameItem = null;

    #[ORM\ManyToOne(targetEntity: Users::class)]
    #[ORM\JoinColumn(name: 'id_seller', referencedColumnName: 'id_user', nullable: false)]
    private ?Users $seller = null;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[ORM\JoinColumn(name: 'id_category', referencedColumnName: 'id_category', nullable: false)]
    private ?Category $category = null;

    // Getters et setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNameItem(): ?string
    {
        return $this->nameItem;
    }

    public function setNameItem(string $nameItem): static
    {
        $this->nameItem = $nameItem;
        return $this;
    }

    public function getSeller(): ?Users
    {
        return $this->seller;
    }

    public function setSeller(Users $seller): static
    {
        $this->seller = $seller;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(Category $category): static
    {
        $this->category = $category;
        return $this;
    }
}

<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\File;

class CreateCompanyDto
{
  public function __construct(
    #[Assert\NotBlank(message: "Le nom de l'entreprise ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $companyname,

    #[Assert\NotBlank(message: "La description de l'entreprise ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $description,

    #[Assert\NotBlank(message: "L'adresse de l'entreprise ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $address,

    #[Assert\File(
      maxSize: "1M",
      mimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      mimeTypesMessage: "Seuls les formats PNG, JPEG, JPG et WEBP sont autorisés"
    )]
    public ?File $logo,
  ) {}
}

<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class CreateTestimonialDto
{
  public function __construct(
    #[Assert\NotBlank(message: "L'avis ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $description,

    #[Assert\NotBlank(message: "La notation ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $rating,

  ) {}
}

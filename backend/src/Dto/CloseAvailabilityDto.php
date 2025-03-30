<?php


namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class CloseAvailabilityDto
{
  public function __construct(
    #[Assert\NotBlank(message: "Le jour ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $day,
  ) {}
}

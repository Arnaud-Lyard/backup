<?php


namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class DeleteAvailabilityDto
{
  public function __construct(
    #[Assert\NotBlank(message: "La disponibilité ne peut pas être vide")]
    #[Assert\Type('number')]
    public int $id,
  ) {}
}

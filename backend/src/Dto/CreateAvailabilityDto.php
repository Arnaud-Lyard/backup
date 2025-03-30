<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class CreateAvailabilityDto
{
  public function __construct(
    #[Assert\NotBlank(message: "Le jour ne peut pas être vide")]
    #[Assert\Type('string')]
    public string $day,

    #[Assert\NotBlank(message: "La date de début ne peut pas être vide")]
    #[Assert\Type(type: "string")]
    public string $startTime,

    #[Assert\NotBlank(message: "La date de fin ne peut pas être vide")]
    #[Assert\Type(type: "string")]
    public string $endTime,
  ) {}

  #[Assert\Callback]
  public function validate(ExecutionContextInterface $context): void
  {
    $start = \DateTime::createFromFormat('H:i', $this->startTime);
    $end = \DateTime::createFromFormat('H:i', $this->endTime);

    if (!$start || !$end) {
      $context->buildViolation('Le format de l\'heure est invalide (attendu HH:MM).')
        ->atPath('startTime')
        ->addViolation();
      return;
    }

    if ($start >= $end) {
      $context->buildViolation('L\'heure de début doit être avant l\'heure de fin.')
        ->atPath('startTime')
        ->addViolation();
    }
  }
}

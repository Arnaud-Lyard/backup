<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class NewUnavailabilityDto
{
  #[Assert\NotBlank(message: "La date de début ne peut pas être vide")]
  #[Assert\Type(type: "string")]
  public string $beginDate;

  #[Assert\NotBlank(message: "La date de fin ne peut pas être vide")]
  #[Assert\Type(type: "string")]
  public string $endDate;
}

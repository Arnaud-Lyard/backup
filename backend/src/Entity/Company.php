<?php

namespace App\Entity;

use App\Repository\CompanyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CompanyRepository::class)]
class Company
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["getPendingCompanies"])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(["getPendingCompanies", "getCompany"])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(["getPendingCompanies", "getCompany"])]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    #[Groups(["getPendingCompanies", "getCompany"])]
    private ?string $address = null;

    #[ORM\OneToOne(inversedBy: 'company', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["getPendingCompanies"])]
    private ?User $owner = null;

    #[ORM\Column(length: 255)]
    #[Groups(["getPendingCompanies"])]
    private ?string $logo = null;

    /**
     * @var Collection<int, UnAvailability>
     */
    #[ORM\OneToMany(targetEntity: UnAvailability::class, mappedBy: 'company')]
    private Collection $unAvailabilities;

    /**
     * @var Collection<int, Availability>
     */
    #[ORM\OneToMany(targetEntity: Availability::class, mappedBy: 'company')]
    private Collection $availabilities;

    public function __construct()
    {
        $this->unAvailabilities = new ArrayCollection();
        $this->availabilities = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): static
    {
        $this->owner = $owner;

        return $this;
    }

    public function getLogo(): ?string
    {
        return $this->logo;
    }

    public function setLogo(string $logo): static
    {
        $this->logo = $logo;

        return $this;
    }

    /**
     * @return Collection<int, UnAvailability>
     */
    public function getUnAvailabilities(): Collection
    {
        return $this->unAvailabilities;
    }

    public function addUnAvailability(UnAvailability $unAvailability): static
    {
        if (!$this->unAvailabilities->contains($unAvailability)) {
            $this->unAvailabilities->add($unAvailability);
            $unAvailability->setCompany($this);
        }

        return $this;
    }

    public function removeUnAvailability(UnAvailability $unAvailability): static
    {
        if ($this->unAvailabilities->removeElement($unAvailability)) {
            // set the owning side to null (unless already changed)
            if ($unAvailability->getCompany() === $this) {
                $unAvailability->setCompany(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Availability>
     */
    public function getAvailabilities(): Collection
    {
        return $this->availabilities;
    }

    public function addAvailability(Availability $availability): static
    {
        if (!$this->availabilities->contains($availability)) {
            $this->availabilities->add($availability);
            $availability->setCompany($this);
        }

        return $this;
    }

    public function removeAvailability(Availability $availability): static
    {
        if ($this->availabilities->removeElement($availability)) {
            // set the owning side to null (unless already changed)
            if ($availability->getCompany() === $this) {
                $availability->setCompany(null);
            }
        }

        return $this;
    }
}

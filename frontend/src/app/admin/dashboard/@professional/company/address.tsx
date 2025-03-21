'use client';

import { Input } from '@/components/common/Input/Input';
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
} from '@/components/common/Listbox';
import { getCountries } from '@/data';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AddressProps {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export function Address({
  street,
  city,
  region,
  postalCode,
  country,
}: AddressProps) {
  const countries = getCountries();
  const initialCountry =
    countries.find((c) => c.name === country) || countries[0];
  const initialRegion = region || initialCountry.regions[0];

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [currentStreet, setCurrentStreet] = useState(street);
  const [currentCity, setCurrentCity] = useState(city);
  const [currentPostalCode, setCurrentPostalCode] = useState(postalCode);

  useEffect(() => {
    if (!selectedCountry.regions.includes(selectedRegion)) {
      setSelectedRegion(selectedCountry.regions[0]);
    }
  }, [selectedCountry, selectedRegion]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Adresse */}
      <Input
        aria-label="Adresse"
        name="address"
        placeholder="Adresse"
        autoComplete="street-address"
        className="col-span-2"
        required
        value={currentStreet}
        onChange={(e) => setCurrentStreet(e.target.value)}
      />

      {/* Ville */}
      <Input
        aria-label="Ville"
        name="city"
        placeholder="Ville"
        autoComplete="address-level2"
        className="col-span-2"
        required
        value={currentCity}
        onChange={(e) => setCurrentCity(e.target.value)}
      />

      {/* Région */}
      <Listbox
        aria-label="Département"
        name="region"
        placeholder="Département"
        value={selectedRegion}
        onChange={(value) => setSelectedRegion(value)}
      >
        {selectedCountry.regions.map((region) => (
          <ListboxOption key={region} value={region}>
            <ListboxLabel>{region}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>

      {/* Code postal */}
      <Input
        aria-label="Code postal"
        name="postalcode"
        placeholder="Code postal"
        autoComplete="postal-code"
        required
        value={currentPostalCode}
        onChange={(e) => setCurrentPostalCode(e.target.value)}
      />

      {/* Pays */}
      <Listbox
        aria-label="Pays"
        name="country"
        placeholder="Pays"
        by="code"
        value={selectedCountry}
        onChange={(country) => setSelectedCountry(country)}
        className="col-span-2"
      >
        {countries.map((country) => (
          <ListboxOption key={country.code} value={country}>
            <Image
              className="w-5 sm:w-4"
              src={country.flagUrl}
              alt=""
              width={20}
              height={20}
            />
            <ListboxLabel>{country.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>

      <Input type="hidden" name="country" value={selectedCountry.name} />
    </div>
  );
}

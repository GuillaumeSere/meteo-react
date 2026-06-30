import React, { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { GEO_API_KEY, GEO_API_URL, geoApiOptions } from "../../api";
import './search.css';

const Search = ({ onSearchChange, isDisabled }) => {

    const [search, setSearch] = useState(null);

    const loadOptions = (inputValue) => {
        if (!GEO_API_KEY || !inputValue.trim()) {
            return Promise.resolve({ options: [] });
        }

        return fetch(`${GEO_API_URL}/cities?minPopulation=1000000&namePrefix=${encodeURIComponent(inputValue)}`, geoApiOptions)
        .then(response => response.json())
        .then(response => {
            return {
                options: (response.data || []).map((city) => {
                    return {
                        value: `${city.latitude} ${city.longitude}`,
                        label: `${city.name}, ${city.countryCode}`,
                    };
                }),
            };
        })
        .catch(err => console.error(err));
    };

    const handleOnChange = (searchData) => {
        setSearch(searchData);
        onSearchChange(searchData);
    };

    return (
        <AsyncPaginate
            className="search-control"
            classNamePrefix="city-select"
            debounceTimeout={500}
            isDisabled={isDisabled}
            loadOptions={loadOptions}
            noOptionsMessage={() => "Tape le nom d'une grande ville"}
            onChange={handleOnChange}
            placeholder="Rechercher une ville"
            value={search}
        />
    )
};

export default Search;

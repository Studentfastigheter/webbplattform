import { type Coordinates } from "@/types/common";

export function getCityCoordinates(cityName: string) {
    const params = new URLSearchParams();
    params.append("format", "json");
    params.append("city", cityName);
    params.append("country", "Sweden")
    return fetch(`https://nominatim.openstreetmap.org/search?${params}`)
        .then(result => result.json())
        .then(data => {
            if (!data[0].lat)
                throw "Latitude not part of response from query";
            if (!data[0].lon)
                throw "Longditude not part of response from query";
            console.log(`Result from geolocate query: ${JSON.stringify(data)}`)
            return {
                lat: data[0].lat as number,
                lng: data[0].lon as number
            } as Coordinates;
        })
        .catch(err => ({ lng: null, lat: null } as Coordinates));
}


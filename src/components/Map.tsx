"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BB_ISO = new Set([
    // Africa
    "204", // Benin
    "108", // Burundi
    "120", // Cameroon
    "180", // DR Congo
    "384", // Côte d’Ivoire
    "270", // Gambia
    "288", // Ghana
    "404", // Kenya
    "426", // Lesotho
    "454", // Malawi
    "566", // Nigeria
    "646", // Rwanda
    "694", // Sierra Leone
    "710", // South Africa
    "834", // Tanzania
    "768", // Togo
    "800", // Uganda
    "894", // Zambia
    "716", // Zimbabwe

    // Americas & Caribbean
    "028", // Antigua and Barbuda
    "660", // Anguilla
    "533", // Aruba
    "044", // Bahamas
    "084", // Belize
    "060", // Bermuda
    "531", // Curacao
    "212", // Dominica
    "308", // Grenada
    "328", // Guyana
    "332", // Haiti
    "388", // Jamaica
    "659", // Saint Kitts and Nevis
    "662", // Saint Lucia
    "670", // Saint Vincent and the Grenadines
    "534", // Sint Eustatius
    "780", // Trinidad and Tobago
    "840", // United States
    "124", // Canada

    // Asia
    "096", // Brunei
    "116", // Cambodia
    "344", // Hong Kong
    "356", // India
    "360", // Indonesia
    "458", // Malaysia
    "446", // Macau
    "608", // Philippines
    "702", // Singapore
    "764", // Thailand
    "626", // Timor-Leste

    // Europe
    "826", // United Kingdom
    "372", // Ireland

    // Oceania
    "036", // Australia
    "184", // Cook Islands
    "242", // Fiji
    "554", // New Zealand
    "598", // Papua New Guinea
    "882", // Samoa
    "090", // Solomon Islands
    "776", // Tonga
    "798"  // Tuvalu
]);

export default function BBWorldMap() {
    const [tooltip, setTooltip] = useState<string | null>(null);

    return (
        <div style={{ width: "100%", position: "relative" }}>
            {tooltip && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "#222",
                        color: "#fff",
                        padding: "6px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        pointerEvents: "none"
                    }}
                >
                    {tooltip}
                </div>
            )}

            <ComposableMap
                projection="geoMercator"
                style={{ width: "100%", height: "400px" }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const numericId = geo.id;
                            const countryName = geo.properties.name;

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={BB_ISO.has(numericId) ? "#5227ff" : "#e6e6ef"}
                                    stroke="#ffffff"
                                    strokeWidth={0.5}
                                    onMouseEnter={() => {
                                        setTooltip(countryName);
                                    }}
                                    onMouseLeave={() => {
                                        setTooltip(null);
                                    }}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#82b1eb", outline: "none" },
                                        pressed: { outline: "none" }
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
}

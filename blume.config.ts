import { defineConfig } from "blume";

import { tablePages } from "./docs/table-catalog";

const tableNavigation = tablePages.map(({ name }) => ({
    label: name,
    href: `/tables/${name}`,
}));

export default defineConfig({
    title: "Calpheon Labs Binary Schemas",
    description:
        "Evidence-backed confidence ledgers for Black Desert BSS and DBSS decoders.",
    content: {
        root: "docs",
    },
    theme: {
        accent: "cyan",
        mode: "dark",
        radius: "none",
    },
    navigation: {
        sidebar: [
            {
                label: "Reference",
                icon: "book-open",
                items: [
                    {
                        label: "Methodology",
                        href: "/methodology",
                    },
                    {
                        label: "Table overview",
                        href: "/tables",
                    },
                    {
                        label: "Tables",
                        icon: "database",
                        display: "group",
                        collapsed: true,
                        items: tableNavigation,
                    },
                ],
            },
        ],
    },
    search: {
        provider: "orama",
        popular: [
            {
                label: "Methodology",
                href: "/methodology",
                icon: "microscope",
            },
            {
                label: "Table confidence",
                href: "/tables",
                icon: "database",
            },
            {
                label: "characterobject.dbss",
                href: "/tables/characterobject.dbss",
                icon: "database",
            },
        ],
    },
});

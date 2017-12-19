import {
    schemeAccent,
    schemeDark2,
    schemePaired,
    schemePastel1,
    schemePastel2,
    schemeSet1,
    schemeSet2,
    schemeSet3,
    interpolateBrBG,
    interpolatePRGn,
    interpolatePiYG,
    interpolatePuOr,
    interpolateRdBu,
    interpolateRdGy,
    interpolateRdYlBu,
    interpolateRdYlGn,
    interpolateSpectral,
    interpolateBlues,
    interpolateGreens,
    interpolateGreys,
    interpolateOranges,
    interpolatePurples,
    interpolateReds,
    interpolateBuGn,
    interpolateBuPu,
    interpolateGnBu,
    interpolateOrRd,
    interpolatePuBuGn,
    interpolatePuBu,
    interpolatePuRd,
    interpolateRdPu,
    interpolateYlGnBu,
    interpolateYlGn,
    interpolateYlOrBr,
    interpolateYlOrRd,
} from 'd3-scale-chromatic';

import {
    schemeCategory10,
    schemeCategory20,
    schemeCategory20b,
    schemeCategory20c,
} from 'd3-scale';

const categoricalColors = {
    schemeaccent: schemeAccent,
    schemedark: schemeDark2,
    schemepaired: schemePaired,
    schemepastel1: schemePastel1,
    schemepastel2: schemePastel2,
    schemeset1: schemeSet1,
    schemeset2: schemeSet2,
    schemeset3: schemeSet3,
    schemecategory10: schemeCategory10,
    schemecategory20: schemeCategory20,
    schemecategory20b: schemeCategory20b,
    schemecategory20c: schemeCategory20c,
};

const divergingColors = {
    BrBG: interpolateBrBG,
    PRGn: interpolatePRGn,
    PiYG: interpolatePiYG,
    PuOr: interpolatePuOr,
    RdBu: interpolateRdBu,
    RdGy: interpolateRdGy,
    RdYlBu: interpolateRdYlBu,
    RdYlGn: interpolateRdYlGn,
    Spectral: interpolateSpectral,
};

const sequentialColors = {
    blues: interpolateBlues,
    greens: interpolateGreens,
    greys: interpolateGreys,
    oranges: interpolateOranges,
    purples: interpolatePurples,
    reds: interpolateReds,
    BuGn: interpolateBuGn,
    BuPu: interpolateBuPu,
    GnBu: interpolateGnBu,
    OrRd: interpolateOrRd,
    PuBuGn: interpolatePuBuGn,
    PuBu: interpolatePuBu,
    PuRd: interpolatePuRd,
    RdPu: interpolateRdPu,
    YlGnBu: interpolateYlGnBu,
    YlGn: interpolateYlGn,
    YlOrBr: interpolateYlOrBr,
    YlOrR: interpolateYlOrRd,
};

export const singleColors = [
    '#5F4690', '#1D6996', '#38A6A5', '#0F8554', '#73AF48', '#EDAD08',
    '#E17C05', '#CC503E', '#94346E', '#6F4070', '#994E95', '#666666',
    '#7F3C8D', '#11A579', '#3969AC', '#F2B701', '#E73F74', '#80BA5A',
    '#E68310', '#008695', '#CF1C90', '#f97b72', '#4b4b8f', '#A5AA99',
];

export const categoricalColorNames = () => Object.keys(categoricalColors);
export const divergingColorNames = () => Object.keys(divergingColors);
export const sequentialColorNames = () => Object.keys(sequentialColors);
export const getCategoryColorScheme = name => categoricalColors[name];
export const getDivergingColorScheme = name => divergingColors[name];
export const getSequentialColorScheme = name => sequentialColors[name];

// Constellation figures for the star-field easter egg. Star positions and line figures come from
// d3-celestial's constellations.lines.json (https://github.com/ofrohn/d3-celestial, BSD-3-Clause),
// gnomonic-projected around each figure's centre, mirrored so east is on the left as in the sky,
// and scaled into a unit box. The Big Dipper is the first line of Ursa Major only.
import type { Lang } from '../lib/blog';

export interface Constellation {
    name: Record<Lang, string>;
    /** [x, y] in a unit box, y downwards. */
    stars: [number, number][];
    /** Pairs of indexes into `stars`. */
    lines: [number, number][];
}

export const CONSTELLATIONS: Constellation[] = [
    {
        name: { en: 'Big Dipper', tr: 'Büyük Kepçe' },
        stars: [[0.595, 0.245], [0.927, 0.0], [1.0, 0.205], [0.726, 0.37], [0.381, 0.279], [0.206, 0.291], [0.0, 0.475]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 5], [5, 6]],
    },
    {
        name: { en: 'Cassiopeia', tr: 'Kraliçe' },
        stars: [[0.0, 0.0], [0.225, 0.314], [0.513, 0.289], [0.695, 0.616], [1.0, 0.366]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    },
    {
        name: { en: 'Orion', tr: 'Avcı' },
        stars: [[0.036, 0.183], [0.146, 0.0], [0.069, 0.001], [0.0, 0.2], [0.075, 0.354], [0.133, 0.429], [0.376, 0.465], [0.619, 0.338], [0.593, 0.615], [0.628, 0.591], [0.652, 0.487], [0.662, 0.442], [0.655, 0.379], [0.605, 0.228], [0.539, 0.167], [0.498, 0.161], [0.464, 0.948], [0.381, 0.751], [0.32, 0.681], [0.296, 0.348], [0.248, 0.736], [0.187, 1.0], [0.285, 0.711]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7], [7, 13], [13, 14], [14, 15], [16, 17], [17, 18], [18, 6], [6, 19], [19, 5], [5, 20], [20, 21], [20, 22], [22, 18]],
    },
    {
        name: { en: 'Cygnus', tr: 'Kuğu' },
        stars: [[0.0, 0.888], [0.244, 0.766], [0.444, 0.536], [0.701, 0.345], [0.775, 0.078], [0.841, 0.0], [0.32, 0.336], [0.64, 0.734], [0.874, 1.0]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [6, 2], [2, 7], [7, 8]],
    },
    {
        name: { en: 'Scorpius', tr: 'Akrep' },
        stars: [[0.946, 0.279], [0.948, 0.127], [0.909, 0.0], [0.734, 0.242], [0.655, 0.275], [0.592, 0.348], [0.464, 0.601], [0.451, 0.758], [0.433, 0.941], [0.298, 0.987], [0.1, 1.0], [0.0, 0.891], [0.036, 0.837], [0.1, 0.744]],
        lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13]],
    },
];

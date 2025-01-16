const ASPECTS: {
  [key: string]: { degree: number; orbit: number; color: string };
} = {
  conjunction: { degree: 0, orbit: 10, color: "transparent" },
  square: { degree: 90, orbit: 8, color: "#FF4500" },
  trine: { degree: 120, orbit: 8, color: "#27AE60" },
  opposition: { degree: 180, orbit: 10, color: "#27AE60" },
  sextile: { degree: 60, orbit: 4, color: "#27AE60" },
};

//Planet1 guaranteed to be from first list
function findAllAspects(
  chart1: { [key: string]: number[] },
  chart2: { [key: string]: number[] }
) {
  const aspects: {
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    color: string;
  }[] = [];

  let done: { [key: string]: number } = {};

  Object.keys(chart1).forEach((planet1) => {
    Object.keys(chart2).forEach((planet2) => {
      if (planet1 !== planet2) {
        const position1 = chart1[planet1][0];
        const position2 = chart2[planet2][0];

        Object.keys(ASPECTS).forEach((aspectName) => {
          const aspect = ASPECTS[aspectName];
          const degreeDiff = Math.abs(position1 - position2);
          const orb = aspect.orbit;

          if (
            degreeDiff >= aspect.degree - orb &&
            degreeDiff <= aspect.degree + orb
          ) {
            const orb = Math.abs(degreeDiff - aspect.degree);

            if (!done[planet1 + planet2]) {
              aspects.push({
                planet1,
                planet2,
                aspect: aspectName,
                orb: orb,
                color: aspect.color,
              });
            }
            done[planet1 + planet2] = 1;
            done[planet2 + planet1] = 1;
          }
        });
      }
    });
  });

  return aspects;
}

export { findAllAspects };

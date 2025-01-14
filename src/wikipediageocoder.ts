async function search(
  query: string
): Promise<{ name: string; lat: number; lon: number } | null> {
  const searchurl = new URL("https://en.wikipedia.org/w/api.php");
  searchurl.searchParams.set("action", "opensearch");
  searchurl.searchParams.set("search", query);
  searchurl.searchParams.set("format", "json");
  searchurl.searchParams.set("namespace", "0");
  searchurl.searchParams.set("limit", "1");
  searchurl.searchParams.set("withCredentials", "false");
  searchurl.searchParams.set("origin", "*");

  const response = await fetch(searchurl);
  const data = await response.json();

  if (data[1].length > 0) {
    const pageurl = new URL("https://en.wikipedia.org/w/api.php");
    pageurl.searchParams.set("action", "query");
    pageurl.searchParams.set("titles", data[1][0]);
    pageurl.searchParams.set("prop", "coordinates");
    pageurl.searchParams.set("format", "json");
    pageurl.searchParams.set("redirects", "true");
    pageurl.searchParams.set("rvslots", "*");
    pageurl.searchParams.set("withCredentials", "false");
    pageurl.searchParams.set("origin", "*");

    const pagedata = await fetch(pageurl);
    const parsed = await pagedata.json();

    for (const key in parsed.query.pages) {
      let title = parsed.query.pages[key].title;
      let coords = parsed.query.pages[key].coordinates[0];
      return {
        name: title,
        lat: coords.lat,
        lon: coords.lon,
      };
      break;
    }
  }
  throw new Error("No results found");
}

async function cachedSearch(
  query: string
): Promise<{ name: string; lat: number; lon: number } | null> {
  query = query.trim().toLocaleLowerCase().replace("  ", " ");
  try {
    let cacheResult = localStorage.getItem("LocationSearch:" + query);

    if (cacheResult) {
      let result = JSON.parse(cacheResult);
      if (result.time > Date.now() / 1000 - 30 * 60 * 60 * 24) {
        {
          return result;
        }
      }
    }
  } catch {
    console.log("error");
  }
  try {
    let res = await search(query);
    if (res) {
      localStorage.setItem(
        "LocationSearch:" + query,
        JSON.stringify({
          name: res.name,
          lat: res.lat,
          lon: res.lon,
          time: Date.now() / 1000,
        })
      );
      return res;
    }
  } catch {
    if (!cachedSearch) {
      throw new Error("No results found");
    }
  }
  if (cachedSearch) {
    return cachedSearch(query);
  }

  throw new Error("No results found");
}

export { search, cachedSearch };

// const coordRegex =
// /^coord\|(\d+)\|(\d+)\|(\d+)\|([NS])\|(\d+)\|(\d+)\|(\d+)\|([EW])\|$/;

// const match = infobox.match(coordRegex);
// if (match) {
// const latDeg = parseInt(match[1]);
// const latMin = parseInt(match[2]);
// const latSec = parseInt(match[3]);
// const latHem = match[4];
// const lonDeg = parseInt(match[5]);
// const lonMin = parseInt(match[6]);
// const lonSec = parseInt(match[7]);
// const lonHem = match[8];

// let lat = latDeg + latMin / 60 + latSec / 3600;
// if (latHem === "S") lat *= -1;
// let lon = lonDeg + lonMin / 60 + lonSec / 3600;
// if (lonHem === "W") lon *= -1;

// return {
//   name: title,
//   lat: lat,
//   lon: lon,
// };
// }

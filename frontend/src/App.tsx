import { useCallback, useEffect, useState } from "react";
import { hot } from "react-hot-loader/root";

function color_hash(s: string) {
  var sum = 0;
  for (var i = 0; i < s.length; i++) {
    sum += s.charCodeAt(i) * i * Math.PI;
  }

  return Math.floor(sum * 9999);
}

function gen_color(s: string) {
  const hash = color_hash(s);
  // return `hsl(${hash % 256},100%,50%)`
  const colors = [
    "#40E0D0", // Turquoise
    "#FF7F50", // Coral
    "#E6E6FA", // Lavender
    "#87CEEB", // Sky Blue
    "#98FB98", // Mint Green
    "#FFDAB9", // Peach
    "#B76E79", // Rose Gold
    "#CCCCFF", // Periwinkle
    "#F7E7CE", // Champagne
    "#C8A2C8", // Lilac
    "#00FFFF", // Aqua
    "#FDD5B1", // Apricot
    "#F5FFFA", // Mint Cream
    "#FF91A4", // Salmon Pink
    "#DAA520", // Goldenrod
    "#6495ED", // Cornflower Blue
    "#367588", // Teal Blue
    "#ACE1AF", // Celadon
    "#9966CC", // Amethyst
    "#E2725B", // Terracotta
  ]

  return colors[hash % (colors.length)];
}

type BarProps = { name: string; value: number; maxValue: number, idx: number };

function Bar({ name, value, maxValue, idx }: BarProps) {
  return (
    <div className="row-root" style={{
      transform: `translateY(${idx}00%)`,
    }}>
      <div className="row-avatar" >
        <Avatar name={name} hasCrown={idx == 0} />
      </div>
      <div className="row-bar-wrapper">
        <div
          className="row-bar"
          style={{
            width: `${(100 * value) / maxValue}%`,
            backgroundColor: gen_color(name),
          }}
        />
      </div>
      <div className="row-value">
        {value}
      </div>
    </div>
  );
}

type AvatarProps = { name: string, hasCrown: boolean };

function Avatar({ name, hasCrown }: AvatarProps) {
  const [url, setUrl] = useState("/placeholder-avatar.png");

  useEffect(() => {
    console.log(`Fetching avatar for ${name}`);
    fetch(`https://api.github.com/users/${name}`).then((response) => {
      response.json().then((json) => setUrl(json.avatar_url));
    }).catch((error) => console.error("GitHub fetch error:", error))
  }, [setUrl]);

  return (
    <div className="avatar-root">
      <img src={url} className="avatar-img" />
      {hasCrown && <img src="crown.png" className="avatar-crown" />}
      <div>@{name}</div>
    </div>
  );
}

async function getData() {
  const response = await fetch("http://localhost:3000/api");
  const json = await response.json();

  return json
}

export default hot(() => {
  const [data, setData] = useState<Record<string, number>>({});

  const update = useCallback(async () => {
    console.log("Updating...");
    const data = await getData();
    setData(data);
  }, [setData])

  useEffect(() => {
    const interval = setInterval(update, 2000);

    return () => clearInterval(interval);
  }, [])

  const max = Object.values(data).reduce((max, value) =>
    (value > max ? value : max), 0
  );

  const indices = Object.entries(data)
    .sort(([_name1, value1], [_name2, value2]) => value2 - value1)
    .map(([name, _value], idx) => ([name, idx]))

  const indices2 = Object.fromEntries(indices)

  console.log(data, indices, indices2);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      <div style={{ fontSize: 60, fontWeight: 800, textAlign: "center" }}>
        Leaderboard
      </div>
      <div style={{ width: "100%", height: Object.keys(data).length * 100, position: "relative" }}>
        {Object.entries(data)
          .map(([name, value]) => (
            <Bar name={name} value={value} maxValue={max} key={name} idx={indices2[name]} />
          ))}
      </div>
    </div>
  );
});

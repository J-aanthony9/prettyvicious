import { SEASON } from "@/lib/brand";
import { BAT_PATH } from "@/components/bat-path";

const STROKE = { stroke: "#E9DFCE", strokeWidth: 0.7 } as const;

/** The default season: the slow turning star mandala. */
function Star() {
  return (
    <svg className="hero-mark hero-turn" viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <g {...STROKE}>
        <path d="M200 8 L212 188 L392 200 L212 212 L200 392 L188 212 L8 200 L188 188 Z" />
        <path d="M200 60 L208 192 L340 200 L208 208 L200 340 L192 208 L60 200 L192 192 Z" />
        <circle cx="200" cy="200" r="150" strokeDasharray="1 7" />
        <circle cx="200" cy="200" r="192" strokeDasharray="1 10" opacity=".6" />
      </g>
    </svg>
  );
}

/**
 * One wing and half the body, engraved: an outline, the finger bones, a
 * stippled second line inside each scallop and a little shading under the
 * arm. Mirrored to make the whole bat.
 */
function BatHalf() {
  return (
    <g {...STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M200 171 C203 170 206 169 207.5 167 L211.5 152 C213.5 159 214.5 167 215.5 173 C217 178 218 182 219 186 C233 181 250 166 266 150 L268.5 141.5 L271 149 C298 147 326 158 350 180 Q321 184 334 217 Q302 204 298 236 Q264 208 230 226 C226 236 220 244 213 251 L216 258 M213 251 C209 249 204 248 200 249" />
      <path d="M208.5 184 C214 194 216.5 210 213 226 C211 236 206.5 243 200 245" />
      <path d="M204 196 L206.5 199 M205 207 L208 210 M205 218 L208 221 M204 229 L206.5 232" opacity=".6" />
      <path d="M268 152 C296 156 324 166 348 180" opacity=".8" />
      <path d="M268 152 C292 172 314 192 334 216" opacity=".8" />
      <path d="M267 153 C276 184 288 210 298 236" opacity=".8" />
      <path
        d="M339 187 Q316 191 327 211 M325 219 Q299 210 295 230 M289 232 Q262 215 236 225"
        strokeDasharray="1 3"
        opacity=".7"
      />
      <path
        d="M223 193 C237 187 251 173 263 159 M226 201 C240 194 253 181 264 167 M230 209 C243 202 255 190 265 176"
        opacity=".5"
      />
      <circle cx="206" cy="180" r="1.1" fill="#E9DFCE" stroke="none" />
    </g>
  );
}

/**
 * All Hallows: a still, engraved bat inside the same dotted rings the star
 * had, with three small bats riding the rings round at the star's pace.
 * Two layers, so only the ring turns and the big bat never tips over.
 */
function Bats() {
  return (
    <>
      <svg className="hero-mark" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <BatHalf />
        <g transform="translate(400 0) scale(-1 1)">
          <BatHalf />
        </g>
      </svg>
      <svg className="hero-mark hero-turn" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <g {...STROKE}>
          <circle cx="200" cy="200" r="150" strokeDasharray="1 7" />
          <circle cx="200" cy="200" r="192" strokeDasharray="1 10" opacity=".6" />
          <path d={BAT_PATH} transform="translate(200 28)" />
          <path d={BAT_PATH} transform="translate(348.95 286) rotate(120) scale(1.1)" />
          <path d={BAT_PATH} transform="translate(51.05 286) rotate(240) scale(0.9)" />
        </g>
      </svg>
    </>
  );
}

export default function HeroMark() {
  return SEASON === "all-hallows" ? <Bats /> : <Star />;
}

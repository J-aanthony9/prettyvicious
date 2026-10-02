const INK = "#E9DFCE";

/**
 * One wing and half the body of the engraved bat: an outline, the finger
 * bones, a stippled second line inside each scallop and a little shading
 * under the arm. Mirror it for the whole bat (see HeroMark and WelcomeVeil).
 *
 * With `draw`, each line is set up to draw itself in (pathLength 1, dashed
 * by the .veil-draw CSS) and the stipple and eye fade in after.
 */
export function BatHalf({ draw = false }: { draw?: boolean }) {
  const line = draw ? { pathLength: 1, className: "veil-draw" } : {};
  const late = draw ? { className: "veil-fade" } : {};
  return (
    <g stroke={INK} strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round">
      <path {...line} d="M200 171 C203 170 206 169 207.5 167 L211.5 152 C213.5 159 214.5 167 215.5 173 C217 178 218 182 219 186 C233 181 250 166 266 150 L268.5 141.5 L271 149 C298 147 326 158 350 180 Q321 184 334 217 Q302 204 298 236 Q264 208 230 226 C226 236 220 244 213 251 L216 258 M213 251 C209 249 204 248 200 249" />
      <path {...line} d="M208.5 184 C214 194 216.5 210 213 226 C211 236 206.5 243 200 245" />
      <path {...late} d="M204 196 L206.5 199 M205 207 L208 210 M205 218 L208 221 M204 229 L206.5 232" opacity=".6" />
      <path {...line} d="M268 152 C296 156 324 166 348 180" opacity=".8" />
      <path {...line} d="M268 152 C292 172 314 192 334 216" opacity=".8" />
      <path {...line} d="M267 153 C276 184 288 210 298 236" opacity=".8" />
      <path
        {...late}
        d="M339 187 Q316 191 327 211 M325 219 Q299 210 295 230 M289 232 Q262 215 236 225"
        strokeDasharray="1 3"
        opacity=".7"
      />
      <path
        {...late}
        d="M223 193 C237 187 251 173 263 159 M226 201 C240 194 253 181 264 167 M230 209 C243 202 255 190 265 176"
        opacity=".5"
      />
      <circle {...late} cx="206" cy="180" r="1.1" fill={INK} stroke="none" />
    </g>
  );
}

/** The whole bat: the half and its mirror. */
export function Bat({ draw = false }: { draw?: boolean }) {
  return (
    <>
      <BatHalf draw={draw} />
      <g transform="translate(400 0) scale(-1 1)">
        <BatHalf draw={draw} />
      </g>
    </>
  );
}

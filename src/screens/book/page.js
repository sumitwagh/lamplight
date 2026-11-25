// One printed page, reused for every place the reader shows a page (left side, both faces of
// each leaf, and the mobile strip). routes.js expands <!--page:path--> markers with this markup.
export const pageMarkup = (v) => `<div class="pg pg-{{${v}.kind}}">
<show-if value="{{${v}.isDed}}"><div class="pg-ded">{{${v}.text}}</div></show-if>
<show-if value="{{${v}.isTitle}}"><div class="pg-title"><span class="pg-k">{{${v}.kicker}}</span><span class="pg-h">{{${v}.title}}</span><span class="pg-s">{{${v}.sub}}</span><span class="pg-orn" aria-hidden="true"></span></div></show-if>
<show-if value="{{${v}.isText}}"><div class="pg-text"><for-each list="{{${v}.paras}}" as="pa"><p><for-each list="{{pa}}" as="sg"><show-if value="{{sg.plain}}">{{sg.text}}</show-if><show-if value="{{sg.hl}}"><mark style="--c:{{sg.color}}">{{sg.text}}<sup>{{sg.n}}</sup></mark></show-if></for-each></p></for-each><span class="pg-f">{{${v}.folio}}</span></div></show-if>
<show-if value="{{${v}.isEnd}}"><div class="pg-end"><span class="pg-h">{{${v}.title}}</span><span class="pg-s">{{${v}.sub}}</span><a href="#/community" class="pg-cta">Join tonight’s read-along →</a></div></show-if>
<show-if value="{{${v}.isBlank}}"><div class="pg-blank-in">Folio<i>.</i></div></show-if>
</div>`;

export const expandPages = (markup) => markup.replace(/<!--page:([\w.]+)-->/g, (_, v) => pageMarkup(v));

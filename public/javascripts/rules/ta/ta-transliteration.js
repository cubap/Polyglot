( function ( $ ) {
	'use strict';

	var taTransliteration = {
		id: 'ta-transliteration',
		name: 'எழுத்துப்பெயர்ப்பு',
		description: 'Tamil Transliteration based input method',
		date: '2012-10-03',
		URL: 'http://github.com/wikimedia/jquery.ime',
		author: 'Junaid P V',
		license: 'GPLv3',
		version: '1.0',
		contextLength: 1,
		maxKeyLength: 4,
		patterns: [
			[ 'ச்h', 'h', 'ச்ஹ்' ],
			[ 'ழ்h', 'h', 'ழ்ஹ்' ],

			// '(ஸ்ரிi|ஸ்ர்I)',
			[ 'ஸ்ர்i', 'ஸ்ரீ' ],

			[ 'க்(ச்|ஸ்)h', 'க்\u200Cஷ்' ], // with ZWNJ
			[ 'க்(ச்|ஸ்)H', 'க்ஷ்' ],

			[ '([க-ஹ])்a', '$1' ],
			[ '([க-ஹ])(்A|a)', '$1ா' ],
			[ '([க-ஹ])்i', '$1ி' ],
			[ '([க-ஹ])(்I|ிi)', '$1ீ' ],
			[ '([க-ஹ])்u', '$1ு' ],
			[ '([க-ஹ])(்U|ுu)', '$1ூ' ],
			[ '([க-ஹ])்e', '$1ெ' ],
			[ '([க-ஹ])(்E|ெe)', '$1ே' ],
			[ '([க-ஹ])i', '$1ை' ],
			[ '([க-ஹ])்o', '$1ொ' ],
			[ '([க-ஹ])(்O|ொo)', '$1ோ' ],
			[ '([க-ஹ])u', '$1ௌ' ],

			[ '([அ-ஹ][ெ-்]?)n', '$1ன்' ],

			[ 'அa', 'ஆ' ],
			[ 'இi', 'ஈ' ],
			[ 'உu', 'ஊ' ],
			[ 'எe', 'ஏ' ],
			[ 'அi', 'ஐ' ],
			[ 'ஒo', 'ஓ' ],
			[ 'அu', 'ஔ' ],

			[ '(ந்|ன்)g', 'ங்' ],
			[ '(ந்|ன்)j', 'ஞ்' ],
			[ 'ச்h', 'ஷ்' ],
			[ 'ழ்h', 'ழ்' ],
			[ 'ட்h', 'த்' ],
			[ 'ஸ்h', 'ஷ்' ],

			[ 'a', 'அ' ],
			[ 'b', 'ப்' ],
			[ 'c', 'ச்' ],
			[ 'd', 'ட்' ],
			[ 'e', 'எ' ],
			[ 'f', 'ஃப்' ],
			[ 'g', 'க்' ],
			[ 'h', 'ஹ்' ],
			[ 'i', 'இ' ],
			[ 'j', 'ஜ்' ],
			[ 'k', 'க்' ],
			[ 'l', 'ல்' ],
			[ 'm', 'ம்' ],
			[ 'n', 'ன்' ],
			[ 'o', 'ஒ' ],
			[ 'p', 'ப்' ],
			[ 'q', 'ஃ' ],
			[ 'r', 'ர்' ],
			[ 's', 'ச்' ],
			[ 't', 'ட்' ],
			[ 'u', 'உ' ],
			[ 'v', 'வ்' ],
			[ 'w', 'ந்' ],
			[ 'y', 'ய்' ],
			[ 'z', 'ழ்' ],
			[ 'A', 'ஆ' ],
			[ 'B', 'ப்' ],
			[ 'C', 'க்க்' ],
			[ 'E', 'ஏ' ],
			[ 'F', 'ஃப்' ],
			[ 'G', 'க்' ],
			[ 'H', 'ஃ' ],
			[ 'I', 'ஈ' ],
			[ 'J', 'ஜ்ஜ்' ],
			[ 'K', 'க்' ],
			[ 'L', 'ள்' ],
			[ 'M', 'ம்ம்' ],
			[ 'N', 'ண்' ],
			[ 'O', 'ஓ' ],
			[ 'P', 'ப்ப்' ],
			[ 'Q', 'ஃ' ],
			[ 'R', 'ற்' ],
			[ 'S', 'ஸ்' ],
			[ 'T', 'ட்' ],
			[ 'U', 'ஊ' ],
			[ '(V|W)', 'வ்வ்' ],
			[ 'Y', 'ய்ய்' ],
			[ 'Z', 'ஶ்' ],

			[ '\\\\0', '\u0be6' ],
			[ '\\\\1', '௧' ],
			[ '\\\\2', '௨' ],
			[ '\\\\3', '௩' ],
			[ '\\\\4', '௪' ],
			[ '\\\\5', '௫' ],
			[ '\\\\6', '௬' ],
			[ '\\\\7', '௭' ],
			[ '\\\\8', '௮' ],
			[ '\\\\9', '௯' ],
			[ '10\\\\', '\u0BF0' ],
			[ '100\\\\', '\u0BF1' ],
			[ '1000\\\\', '\u0BF2' ] ]
	};

	$.ime.register( taTransliteration );
}( jQuery ) );

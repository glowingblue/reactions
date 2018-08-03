import emojis from '../generated/emojis.json';

const flatten = (arr, depth = 1) => arr.reduce((a, v) => a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v), []);
const shortnames = flatten(Object.values(emojis));
const entries = Object.entries(emojis);
const getEmoji = identifier => entries.find(([key, value]) => value.includes(identifier));
const toUnicodeEmoji = codePoint => String.fromCodePoint(...codePoint.split('-').map(e => `0x${e}`));

export class Match {
    /**
     * Match
     * Creates a new `Match` instance.
     *
     * It contains the following properties:
     *
     *  - `input` (String): The input string.
     *  - `score` (Number): A number between `0` and `1`. The closer to `1` it is, the better match it is.
     *  - `emoji` (Object): The emoji object.
     *  - `emoji_name` (String): The emoji name.
     *
     * @name Match
     * @function
     * @param {String} input The input string (just a word).
     */
    constructor(input) {
        let r = emojis[input],
            finalScore = -1,
            emojiName = null;

        this.input = input;

        if (r) {
            finalScore = 1;
            emojiName = input;
        } else {
            Object.entries(emojis).forEach(([n, e]) => {
                for (let i = 0; i <= e.length; ++i) {
                    const c = e[i] || n,
                        equals = c === input,
                        indexF = c.indexOf(input),
                        indexS = input.indexOf(c),
                        score = equals && input.length ? 1 : indexF === 0 || (indexS === 0 && c.length > 1) ? 1 : indexF > 0 || indexS > 0 ? 0 : -1;

                    if (score > finalScore) {
                        emojiName = n;
                        finalScore = score;
                        if (score === 1) {
                            return false;
                        }
                    }
                }
            });
        }

        this.score = finalScore;
        this.emoji = emojiName;
    }
}

export default reactionOrIdentifier => {
    if (!reactionOrIdentifier) return {};
    const identifier = reactionOrIdentifier.identifier || reactionOrIdentifier;
    let codePoint;

    if (shortnames.includes(identifier)) {
        const emoji = getEmoji(identifier);
        codePoint = emoji && emoji[0];
    } else {
        const match = new Match(identifier);
        if (match.score) codePoint = match.emoji;
    }

    return codePoint
        ? {
              identifier,
              uc: toUnicodeEmoji(codePoint),
              url: `https://twemoji.maxcdn.com/2/72x72/${codePoint}.png`,
              type: 'emoji',
          }
        : {};
};

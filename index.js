// LarpScript - Text replacement and badge customization for Kettu/Vendetta
const { storage } = vendetta.plugin;
const { React } = vendetta.metro.common;
const { findByProps } = vendetta.metro;
const { Forms } = vendetta.ui.components;
const { showToast } = vendetta.ui.toasts;
const { useProxy } = vendetta.storage;

// Initialize storage
storage.textReplacements ??= [];
storage.isTextReplaceEnabled ??= true;
storage.enabledBadges ??= [];
storage.selectedNitroBadge ??= 'NONE';

// All Discord badges
const ALL_BADGES = {
    STAFF: { flag: 1 << 0, name: 'Discord Staff' },
    PARTNER: { flag: 1 << 1, name: 'Partnered Server Owner' },
    HYPESQUAD: { flag: 1 << 2, name: 'HypeSquad Events' },
    BUG_HUNTER_LEVEL_1: { flag: 1 << 3, name: 'Bug Hunter Level 1' },
    HYPESQUAD_ONLINE_HOUSE_1: { flag: 1 << 6, name: 'HypeSquad Bravery' },
    HYPESQUAD_ONLINE_HOUSE_2: { flag: 1 << 7, name: 'HypeSquad Brilliance' },
    HYPESQUAD_ONLINE_HOUSE_3: { flag: 1 << 8, name: 'HypeSquad Balance' },
    PREMIUM_EARLY_SUPPORTER: { flag: 1 << 9, name: 'Early Supporter' },
    BUG_HUNTER_LEVEL_2: { flag: 1 << 14, name: 'Bug Hunter Level 2' },
    VERIFIED_DEVELOPER: { flag: 1 << 17, name: 'Early Verified Bot Developer' },
    DISCORD_CERTIFIED_MODERATOR: { flag: 1 << 18, name: 'Moderator Programs Alumni' },
    ACTIVE_DEVELOPER: { flag: 1 << 22, name: 'Active Developer' }
};

// Nitro tenure badges
const NITRO_BADGES = {
    NONE: { months: 0, name: 'No Badge', color: '#99aab5' },
    BRONZE: { months: 1, name: '1 month', color: '#cd7f32' },
    SILVER: { months: 2, name: '2 months', color: '#c0c0c0' },
    GOLD: { months: 3, name: '3 months', color: '#ffd700' },
    PLATINUM: { months: 6, name: '6 months', color: '#e5e4e2' },
    DIAMOND: { months: 12, name: '12 months', color: '#b9f2ff' },
    EMERALD: { months: 15, name: '15 months', color: '#50c878' },
    RUBY: { months: 18, name: '18 months', color: '#e0115f' },
    OPAL: { months: 24, name: '24 months', color: '#a8c3bc' }
};

let patches = [];

// Settings component
function Settings() {
    useProxy(storage);
    const [newFind, setNewFind] = React.useState('');
    const [newReplace, setNewReplace] = React.useState('');

    return React.createElement(Forms.FormSection, { title: 'Text Replacement' },
        React.createElement(Forms.FormSwitchRow, {
            label: 'Enable Text Replacement',
            value: storage.isTextReplaceEnabled,
            onValueChange: (v) => storage.isTextReplaceEnabled = v
        }),
        React.createElement(Forms.FormRow, {
            label: `Replacements: ${storage.textReplacements.length}`,
            subLabel: 'Tap to manage'
        }),
        React.createElement(Forms.FormSection, { title: 'Profile Badges' }),
        ...Object.entries(ALL_BADGES).map(([key, badge]) =>
            React.createElement(Forms.FormSwitchRow, {
                key: key,
                label: badge.name,
                value: storage.enabledBadges.includes(key),
                onValueChange: (v) => {
                    if (v) {
                        storage.enabledBadges = [...storage.enabledBadges, key];
                    } else {
                        storage.enabledBadges = storage.enabledBadges.filter(b => b !== key);
                    }
                }
            })
        ),
        React.createElement(Forms.FormSection, { title: 'Nitro Badge' }),
        ...Object.entries(NITRO_BADGES).map(([key, badge]) =>
            React.createElement(Forms.FormRow, {
                key: key,
                label: badge.name,
                trailing: storage.selectedNitroBadge === key ? '✓' : '',
                onPress: () => {
                    storage.selectedNitroBadge = key;
                    showToast(`Selected: ${badge.name}`);
                }
            })
        )
    );
}

export function onLoad() {
    // Patch message sending
    const MessageActions = findByProps('sendMessage');
    if (MessageActions) {
        patches.push(vendetta.patcher.before('sendMessage', MessageActions, (args) => {
            if (!storage.isTextReplaceEnabled) return;
            const [, message] = args;
            if (message?.content) {
                let content = message.content;
                storage.textReplacements.forEach(rep => {
                    content = content.split(rep.find).join(rep.replace);
                });
                message.content = content;
            }
        }));
    }

    // Patch user profile
    const UserStore = findByProps('getCurrentUser', 'getUser');
    if (UserStore) {
        patches.push(vendetta.patcher.after('getCurrentUser', UserStore, (_, ret) => {
            if (!ret) return;
            
            // Apply badges
            if (storage.enabledBadges.length > 0) {
                let flags = ret.flags || 0;
                storage.enabledBadges.forEach(badgeKey => {
                    const badge = ALL_BADGES[badgeKey];
                    if (badge) flags |= badge.flag;
                });
                ret.flags = flags;
            }

            // Apply Nitro badge
            if (storage.selectedNitroBadge !== 'NONE') {
                const badge = NITRO_BADGES[storage.selectedNitroBadge];
                if (badge?.months > 0) {
                    ret.premiumType = 2;
                    ret.premium = true;
                    const now = new Date();
                    now.setMonth(now.getMonth() - badge.months);
                    ret.premiumSince = now.toISOString();
                }
            }
        }));
    }
}

export function onUnload() {
    patches.forEach(p => p());
    patches = [];
}

export const settings = Settings;

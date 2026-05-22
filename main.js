/**
 * @name LarpScript
 * @description Advanced text replacement and badge customization plugin for Kettu
 * @version 1.0.0
 * @author vampire
 */

const { React, Webpack } = kettu;
const { Filters } = Webpack;

// Text replacement storage
let textReplacements = [];
let isTextReplaceEnabled = true;

// Badge configuration - All Discord badges
const ALL_BADGES = {
    STAFF: { id: 'staff', flag: 1 << 0, name: 'Discord Staff', description: 'Discord Employee' },
    PARTNER: { id: 'partner', flag: 1 << 1, name: 'Partnered Server Owner', description: 'Partnered Server Owner' },
    HYPESQUAD: { id: 'hypesquad', flag: 1 << 2, name: 'HypeSquad Events', description: 'HypeSquad Events Member' },
    HYPESQUAD_ONLINE_HOUSE_1: { id: 'hypesquad_bravery', flag: 1 << 6, name: 'HypeSquad Bravery', description: 'HypeSquad Bravery' },
    HYPESQUAD_ONLINE_HOUSE_2: { id: 'hypesquad_brilliance', flag: 1 << 7, name: 'HypeSquad Brilliance', description: 'HypeSquad Brilliance' },
    HYPESQUAD_ONLINE_HOUSE_3: { id: 'hypesquad_balance', flag: 1 << 8, name: 'HypeSquad Balance', description: 'HypeSquad Balance' },
    BUG_HUNTER_LEVEL_1: { id: 'bug_hunter_1', flag: 1 << 3, name: 'Bug Hunter Level 1', description: 'Bug Hunter Level 1' },
    BUG_HUNTER_LEVEL_2: { id: 'bug_hunter_2', flag: 1 << 14, name: 'Bug Hunter Level 2', description: 'Bug Hunter Level 2' },
    ACTIVE_DEVELOPER: { id: 'active_developer', flag: 1 << 22, name: 'Active Developer', description: 'Active Developer' },
    VERIFIED_DEVELOPER: { id: 'verified_developer', flag: 1 << 17, name: 'Early Verified Bot Developer', description: 'Early Verified Bot Developer' },
    PREMIUM_EARLY_SUPPORTER: { id: 'early_supporter', flag: 1 << 9, name: 'Early Supporter', description: 'Early Supporter' },
    TEAM_PSEUDO_USER: { id: 'team_user', flag: 1 << 10, name: 'Team User', description: 'Team User' },
    VERIFIED_BOT: { id: 'verified_bot', flag: 1 << 16, name: 'Verified Bot', description: 'Verified Bot' },
    DISCORD_CERTIFIED_MODERATOR: { id: 'certified_moderator', flag: 1 << 18, name: 'Moderator Programs Alumni', description: 'Moderator Programs Alumni' },
    BOT_HTTP_INTERACTIONS: { id: 'bot_http', flag: 1 << 19, name: 'HTTP Bot', description: 'Bot uses HTTP Interactions' },
    SPAMMER: { id: 'spammer', flag: 1 << 20, name: 'Spammer', description: 'Spammer' },
    PREMIUM: { id: 'nitro', flag: 1 << 21, name: 'Nitro', description: 'Subscriber since [date]' },
    GUILD_BOOSTER_LVL1: { id: 'booster_1', flag: 1 << 23, name: 'Server Booster', description: 'Server Booster Level 1' },
    GUILD_BOOSTER_LVL2: { id: 'booster_2', flag: 1 << 24, name: 'Server Booster', description: 'Server Booster Level 2' },
    GUILD_BOOSTER_LVL3: { id: 'booster_3', flag: 1 << 25, name: 'Server Booster', description: 'Server Booster Level 3' },
    GUILD_BOOSTER_LVL4: { id: 'booster_4', flag: 1 << 26, name: 'Server Booster', description: 'Server Booster Level 4' },
    GUILD_BOOSTER_LVL5: { id: 'booster_5', flag: 1 << 27, name: 'Server Booster', description: 'Server Booster Level 5' },
    GUILD_BOOSTER_LVL6: { id: 'booster_6', flag: 1 << 28, name: 'Server Booster', description: 'Server Booster Level 6' },
    GUILD_BOOSTER_LVL7: { id: 'booster_7', flag: 1 << 29, name: 'Server Booster', description: 'Server Booster Level 7' },
    GUILD_BOOSTER_LVL8: { id: 'booster_8', flag: 1 << 30, name: 'Server Booster', description: 'Server Booster Level 8' },
    GUILD_BOOSTER_LVL9: { id: 'booster_9', flag: 1 << 31, name: 'Server Booster', description: 'Server Booster Level 9' }
};

let enabledBadges = [];

// Real Discord Nitro tenure badges (subscription length milestones)
const NITRO_BADGES = {
    NONE: { 
        id: 'none', 
        months: 0, 
        name: 'No Badge', 
        description: 'Not subscribed to Nitro', 
        color: '#99aab5',
        icon: ''
    },
    BRONZE: { 
        id: 'premium_guild_subscription_months_1', 
        months: 1, 
        name: 'Subscriber since 1 month', 
        description: 'Subscriber since 1 month', 
        color: '#cd7f32',
        icon: '🥉'
    },
    SILVER: { 
        id: 'premium_guild_subscription_months_2', 
        months: 2, 
        name: 'Subscriber since 2 months', 
        description: 'Subscriber since 2 months', 
        color: '#c0c0c0',
        icon: '🥈'
    },
    GOLD: { 
        id: 'premium_guild_subscription_months_3', 
        months: 3, 
        name: 'Subscriber since 3 months', 
        description: 'Subscriber since 3 months', 
        color: '#ffd700',
        icon: '🥇'
    },
    PLATINUM: { 
        id: 'premium_guild_subscription_months_6', 
        months: 6, 
        name: 'Subscriber since 6 months', 
        description: 'Subscriber since 6 months', 
        color: '#e5e4e2',
        icon: '�'
    },
    DIAMOND: { 
        id: 'premium_guild_subscription_months_12', 
        months: 12, 
        name: 'Subscriber since 12 months', 
        description: 'Subscriber since 12 months', 
        color: '#b9f2ff',
        icon: '💎'
    },
    EMERALD: { 
        id: 'premium_guild_subscription_months_15', 
        months: 15, 
        name: 'Subscriber since 15 months', 
        description: 'Subscriber since 15 months', 
        color: '#50c878',
        icon: '�'
    },
    RUBY: { 
        id: 'premium_guild_subscription_months_18', 
        months: 18, 
        name: 'Subscriber since 18 months', 
        description: 'Subscriber since 18 months', 
        color: '#e0115f',
        icon: '❤️'
    },
    OPAL: { 
        id: 'premium_guild_subscription_months_24', 
        months: 24, 
        name: 'Subscriber since 24 months', 
        description: 'Subscriber since 24 months', 
        color: '#a8c3bc',
        icon: '🌈'
    }
};

let selectedNitroBadge = 'NONE';

// Settings panel component
function SettingsPanel() {
    const [replacements, setReplacements] = React.useState([...textReplacements]);
    const [enabled, setEnabled] = React.useState(isTextReplaceEnabled);
    const [badges, setBadges] = React.useState([...enabledBadges]);
    const [nitroBadge, setNitroBadge] = React.useState(selectedNitroBadge);
    const [newFind, setNewFind] = React.useState('');
    const [newReplace, setNewReplace] = React.useState('');

    const addReplacement = () => {
        if (newFind.trim()) {
            const newRep = { find: newFind, replace: newReplace, regex: false };
            const updated = [...replacements, newRep];
            setReplacements(updated);
            textReplacements = updated;
            setNewFind('');
            setNewReplace('');
        }
    };

    const removeReplacement = (index) => {
        const updated = replacements.filter((_, i) => i !== index);
        setReplacements(updated);
        textReplacements = updated;
    };

    const toggleEnabled = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        isTextReplaceEnabled = newEnabled;
    };

    const toggleBadge = (badgeId) => {
        const updated = badges.includes(badgeId)
            ? badges.filter(b => b !== badgeId)
            : [...badges, badgeId];
        setBadges(updated);
        enabledBadges = updated;
    };

    const toggleAllBadges = () => {
        if (badges.length === Object.keys(ALL_BADGES).length) {
            setBadges([]);
            enabledBadges = [];
        } else {
            const allIds = Object.keys(ALL_BADGES);
            setBadges(allIds);
            enabledBadges = allIds;
        }
    };

    const selectNitroBadge = (badgeKey) => {
        setNitroBadge(badgeKey);
        selectedNitroBadge = badgeKey;
    };

    return React.createElement('div', { style: { padding: '20px', color: '#dcddde' } },
        // Header
        React.createElement('h2', { style: { marginBottom: '20px', color: '#fff' } }, 'LarpScript Settings'),
        
        // Text Replacement Section
        React.createElement('div', { style: { marginBottom: '30px' } },
            React.createElement('h3', { style: { marginBottom: '15px', color: '#fff' } }, 'Text Replacement'),
            React.createElement('div', { style: { marginBottom: '15px' } },
                React.createElement('label', { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' } },
                    React.createElement('input', {
                        type: 'checkbox',
                        checked: enabled,
                        onChange: toggleEnabled,
                        style: { marginRight: '10px' }
                    }),
                    'Enable Text Replacement'
                )
            ),
            
            // Add new replacement
            React.createElement('div', { style: { marginBottom: '15px', display: 'flex', gap: '10px' } },
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Find text...',
                    value: newFind,
                    onChange: (e) => setNewFind(e.target.value),
                    style: { flex: 1, padding: '8px', background: '#202225', border: '1px solid #202225', borderRadius: '3px', color: '#dcddde' }
                }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Replace with...',
                    value: newReplace,
                    onChange: (e) => setNewReplace(e.target.value),
                    style: { flex: 1, padding: '8px', background: '#202225', border: '1px solid #202225', borderRadius: '3px', color: '#dcddde' }
                }),
                React.createElement('button', {
                    onClick: addReplacement,
                    style: { padding: '8px 16px', background: '#5865f2', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer' }
                }, 'Add')
            ),
            
            // Replacement list
            React.createElement('div', { style: { maxHeight: '200px', overflowY: 'auto' } },
                replacements.map((rep, index) =>
                    React.createElement('div', {
                        key: index,
                        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#2f3136', marginBottom: '5px', borderRadius: '3px' }
                    },
                        React.createElement('span', null, `"${rep.find}" → "${rep.replace}"`),
                        React.createElement('button', {
                            onClick: () => removeReplacement(index),
                            style: { padding: '4px 12px', background: '#ed4245', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer' }
                        }, 'Remove')
                    )
                )
            )
        ),
        
        // Badges Section
        React.createElement('div', { style: { marginBottom: '30px' } },
            React.createElement('h3', { style: { marginBottom: '15px', color: '#fff' } }, 'Profile Badges'),
            React.createElement('div', { style: { marginBottom: '15px' } },
                React.createElement('button', {
                    onClick: toggleAllBadges,
                    style: { padding: '8px 16px', background: '#5865f2', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer' }
                }, badges.length === Object.keys(ALL_BADGES).length ? 'Deselect All' : 'Select All Badges')
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' } },
                Object.entries(ALL_BADGES).map(([key, badge]) =>
                    React.createElement('label', {
                        key: key,
                        style: { display: 'flex', alignItems: 'center', padding: '10px', background: '#2f3136', borderRadius: '3px', cursor: 'pointer' }
                    },
                        React.createElement('input', {
                            type: 'checkbox',
                            checked: badges.includes(key),
                            onChange: () => toggleBadge(key),
                            style: { marginRight: '10px' }
                        }),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontWeight: 'bold', color: '#fff' } }, badge.name),
                            React.createElement('div', { style: { fontSize: '12px', color: '#b9bbbe' } }, badge.description)
                        )
                    )
                )
            )
        ),

        // Nitro Subscription Section
        React.createElement('div', null,
            React.createElement('h3', { style: { marginBottom: '15px', color: '#fff' } }, 'Nitro Subscription Badge'),
            React.createElement('div', { style: { marginBottom: '10px', padding: '15px', background: '#2f3136', borderRadius: '5px', border: '2px solid ' + NITRO_BADGES[nitroBadge].color } },
                React.createElement('div', { style: { fontWeight: 'bold', color: '#fff', marginBottom: '5px' } }, 'Current Badge:'),
                React.createElement('div', { 
                    style: { 
                        color: NITRO_BADGES[nitroBadge].color, 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                    } 
                }, 
                    NITRO_BADGES[nitroBadge].icon ? `${NITRO_BADGES[nitroBadge].icon} ` : '',
                    NITRO_BADGES[nitroBadge].name
                ),
                React.createElement('div', { style: { fontSize: '13px', color: '#b9bbbe' } }, 
                    NITRO_BADGES[nitroBadge].description
                )
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' } },
                Object.entries(NITRO_BADGES).map(([key, badge]) =>
                    React.createElement('button', {
                        key: key,
                        onClick: () => selectNitroBadge(key),
                        title: badge.description,
                        style: { 
                            padding: '18px',
                            background: nitroBadge === key ? badge.color + '22' : '#2f3136',
                            border: nitroBadge === key ? '3px solid ' + badge.color : '2px solid #202225',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            position: 'relative'
                        },
                        onMouseEnter: (e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                            if (nitroBadge !== key) {
                                e.currentTarget.style.borderColor = badge.color;
                            }
                        },
                        onMouseLeave: (e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            if (nitroBadge !== key) {
                                e.currentTarget.style.borderColor = '#202225';
                            }
                        }
                    },
                        React.createElement('div', { 
                            style: { 
                                fontSize: '32px',
                                marginBottom: '8px'
                            } 
                        }, badge.icon || '⭕'),
                        React.createElement('div', { 
                            style: { 
                                fontWeight: 'bold', 
                                color: badge.color,
                                marginBottom: '6px',
                                fontSize: '15px'
                            } 
                        }, badge.name.replace('Subscriber since ', '')),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '11px', 
                                color: '#b9bbbe',
                                lineHeight: '1.3'
                            } 
                        }, badge.months > 0 ? `${badge.months} month${badge.months > 1 ? 's' : ''}` : 'No badge')
                    )
                )
            )
        )
    );
}

// Message send patch for text replacement
function patchMessageSend() {
    const MessageActions = Webpack.findByProps('sendMessage', 'editMessage');
    if (!MessageActions) return;

    kettu.patcher.before('larpscript-text-replace', MessageActions, 'sendMessage', (args) => {
        if (!isTextReplaceEnabled || textReplacements.length === 0) return;
        
        const [, message] = args;
        if (!message || !message.content) return;

        let content = message.content;
        textReplacements.forEach(rep => {
            if (rep.regex) {
                try {
                    const regex = new RegExp(rep.find, 'gi');
                    content = content.replace(regex, rep.replace);
                } catch (e) {
                    console.error('Invalid regex:', rep.find);
                }
            } else {
                content = content.split(rep.find).join(rep.replace);
            }
        });
        
        message.content = content;
    });
}

// Badge and Nitro patch
function patchBadges() {
    const UserStore = Webpack.findByProps('getCurrentUser', 'getUser');
    if (!UserStore) return;

    kettu.patcher.after('larpscript-badges', UserStore, 'getCurrentUser', (_, __, user) => {
        if (!user) return user;

        // Apply badge flags
        if (enabledBadges.length > 0) {
            let flags = user.flags || 0;
            enabledBadges.forEach(badgeKey => {
                const badge = ALL_BADGES[badgeKey];
                if (badge) {
                    flags |= badge.flag;
                }
            });
            user.flags = flags;
        }

        // Apply Nitro badge (subscription tenure)
        if (selectedNitroBadge && selectedNitroBadge !== 'NONE') {
            const badgeData = NITRO_BADGES[selectedNitroBadge];
            if (badgeData && badgeData.months > 0) {
                // Set premium type to Nitro (2)
                user.premiumType = 2;
                user.premium = true;
                
                // Calculate subscription start date based on months
                const now = new Date();
                const startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - badgeData.months);
                user.premiumSince = startDate.toISOString();
                
                // Set premium guild subscription months for the badge
                user.premiumGuildSince = startDate.toISOString();
            }
        }

        return user;
    });

    // Also patch getUser for profile views
    kettu.patcher.after('larpscript-badges-getuser', UserStore, 'getUser', (args, _, user) => {
        if (!user) return user;
        
        const currentUser = UserStore.getCurrentUser();
        if (user.id !== currentUser?.id) return user;

        // Apply badge flags
        if (enabledBadges.length > 0) {
            let flags = user.flags || 0;
            enabledBadges.forEach(badgeKey => {
                const badge = ALL_BADGES[badgeKey];
                if (badge) {
                    flags |= badge.flag;
                }
            });
            user.flags = flags;
        }

        // Apply Nitro badge
        if (selectedNitroBadge && selectedNitroBadge !== 'NONE') {
            const badgeData = NITRO_BADGES[selectedNitroBadge];
            if (badgeData && badgeData.months > 0) {
                user.premiumType = 2;
                user.premium = true;
                
                const now = new Date();
                const startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - badgeData.months);
                user.premiumSince = startDate.toISOString();
                user.premiumGuildSince = startDate.toISOString();
            }
        }

        return user;
    });
}

// Plugin lifecycle
export function onLoad() {
    console.log('[LarpScript] Plugin loaded');
    patchMessageSend();
    patchBadges();
}

export function onUnload() {
    console.log('[LarpScript] Plugin unloaded');
    kettu.patcher.unpatchAll('larpscript-text-replace');
    kettu.patcher.unpatchAll('larpscript-badges');
    kettu.patcher.unpatchAll('larpscript-badges-getuser');
}

export function getSettingsPanel() {
    return React.createElement(SettingsPanel);
}

(function(module, vendetta) {
    "use strict";
    
    const { storage } = vendetta.plugin;
    const { React } = vendetta.metro.common;
    const { findByProps } = vendetta.metro;
    const { Forms } = vendetta.ui.components;
    const { showToast } = vendetta.ui.toasts;
    const { useProxy } = vendetta.storage;

    // Initialize storage
    storage.textReplacements = storage.textReplacements || [];
    storage.isTextReplaceEnabled = storage.isTextReplaceEnabled !== false;
    storage.enabledBadges = storage.enabledBadges || [];
    storage.selectedNitroBadge = storage.selectedNitroBadge || 'NONE';

    // All Discord badges
    const ALL_BADGES = {
        STAFF: { flag: 1, name: 'Discord Staff' },
        PARTNER: { flag: 2, name: 'Partnered Server Owner' },
        HYPESQUAD: { flag: 4, name: 'HypeSquad Events' },
        BUG_HUNTER_LEVEL_1: { flag: 8, name: 'Bug Hunter Level 1' },
        HYPESQUAD_ONLINE_HOUSE_1: { flag: 64, name: 'HypeSquad Bravery' },
        HYPESQUAD_ONLINE_HOUSE_2: { flag: 128, name: 'HypeSquad Brilliance' },
        HYPESQUAD_ONLINE_HOUSE_3: { flag: 256, name: 'HypeSquad Balance' },
        PREMIUM_EARLY_SUPPORTER: { flag: 512, name: 'Early Supporter' },
        BUG_HUNTER_LEVEL_2: { flag: 16384, name: 'Bug Hunter Level 2' },
        VERIFIED_DEVELOPER: { flag: 131072, name: 'Early Verified Bot Developer' },
        DISCORD_CERTIFIED_MODERATOR: { flag: 262144, name: 'Moderator Programs Alumni' },
        ACTIVE_DEVELOPER: { flag: 4194304, name: 'Active Developer' }
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

        return React.createElement(React.Fragment, null,
            React.createElement(Forms.FormSection, { title: 'Text Replacement' },
                React.createElement(Forms.FormSwitchRow, {
                    label: 'Enable Text Replacement',
                    value: storage.isTextReplaceEnabled,
                    onValueChange: function(v) { storage.isTextReplaceEnabled = v; }
                }),
                React.createElement(Forms.FormRow, {
                    label: 'Replacements: ' + storage.textReplacements.length,
                    subLabel: 'Tap to manage'
                })
            ),
            React.createElement(Forms.FormSection, { title: 'Profile Badges' },
                Object.keys(ALL_BADGES).map(function(key) {
                    const badge = ALL_BADGES[key];
                    return React.createElement(Forms.FormSwitchRow, {
                        key: key,
                        label: badge.name,
                        value: storage.enabledBadges.indexOf(key) !== -1,
                        onValueChange: function(v) {
                            if (v) {
                                storage.enabledBadges = storage.enabledBadges.concat([key]);
                            } else {
                                storage.enabledBadges = storage.enabledBadges.filter(function(b) { return b !== key; });
                            }
                        }
                    });
                })
            ),
            React.createElement(Forms.FormSection, { title: 'Nitro Badge' },
                Object.keys(NITRO_BADGES).map(function(key) {
                    const badge = NITRO_BADGES[key];
                    return React.createElement(Forms.FormRow, {
                        key: key,
                        label: badge.name,
                        trailing: storage.selectedNitroBadge === key ? '✓' : '',
                        onPress: function() {
                            storage.selectedNitroBadge = key;
                            showToast('Selected: ' + badge.name);
                        }
                    });
                })
            )
        );
    }

    const onLoad = function() {
        // Patch message sending
        const MessageActions = findByProps('sendMessage');
        if (MessageActions) {
            patches.push(vendetta.patcher.before('sendMessage', MessageActions, function(args) {
                if (!storage.isTextReplaceEnabled) return;
                const message = args[1];
                if (message && message.content) {
                    let content = message.content;
                    storage.textReplacements.forEach(function(rep) {
                        content = content.split(rep.find).join(rep.replace);
                    });
                    message.content = content;
                }
            }));
        }

        // Patch user profile
        const UserStore = findByProps('getCurrentUser', 'getUser');
        if (UserStore) {
            patches.push(vendetta.patcher.after('getCurrentUser', UserStore, function(_, ret) {
                if (!ret) return;
                
                // Apply badges
                if (storage.enabledBadges.length > 0) {
                    let flags = ret.flags || 0;
                    storage.enabledBadges.forEach(function(badgeKey) {
                        const badge = ALL_BADGES[badgeKey];
                        if (badge) flags |= badge.flag;
                    });
                    ret.flags = flags;
                }

                // Apply Nitro badge
                if (storage.selectedNitroBadge !== 'NONE') {
                    const badge = NITRO_BADGES[storage.selectedNitroBadge];
                    if (badge && badge.months > 0) {
                        ret.premiumType = 2;
                        ret.premium = true;
                        const now = new Date();
                        now.setMonth(now.getMonth() - badge.months);
                        ret.premiumSince = now.toISOString();
                    }
                }
            }));
        }
    };

    const onUnload = function() {
        patches.forEach(function(p) { p(); });
        patches = [];
    };

    module.onLoad = onLoad;
    module.onUnload = onUnload;
    module.settings = Settings;

    return module;
})({}, vendetta);

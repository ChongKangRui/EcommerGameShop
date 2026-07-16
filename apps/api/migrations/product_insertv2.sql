-- ============================================================
-- Seed script: RedfieldGamingDB test data (with descriptions)
-- Source: gameshop.my (name, cover image, price scraped from
-- live collection/product pages, per category, on 2026-07-07)
-- Descriptions written as bullet-point summaries for product pages
-- ============================================================

BEGIN;

-- 1. Wipe previously inserted test data (cascades to variations)
DELETE FROM product_variations;
DELETE FROM products;
ALTER SEQUENCE products_product_id_seq RESTART WITH 1;

-- 2. Insert products (with descriptions), then auto-generate one
--    "Standard" variation per product using the same cover image.
WITH inserted_products AS (
    INSERT INTO products (name, cover_image_url, price, type, is_sold_out, release_date, discount_percentage, description)
    VALUES
    -- ===================== PS5 (19) =====================
    ('Monopoly: Star Wars Heroes vs. Villains (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5MonopolyStarWarsHeroesvsVillains.jpg?v=1783255888&width=533', 170.00, 'ps5', false, '2026-07-05', 0,
$$- Classic Monopoly gameplay reimagined with a Star Wars Heroes vs. Villains theme
- Play as iconic characters from across the Star Wars saga
- Local and online multiplayer board game modes
- Asia region release, PS5 exclusive$$),

    ('Thrustmaster Raceline Pedals LTE', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsLTE1.jpg?v=1783175768&width=533', 497.00, 'ps5', false, '2026-06-23', 0,
$$- Entry-level 3-pedal set (throttle, brake, clutch) for sim racing
- Adjustable pedal spacing and resistance for custom feel
- Compatible with PS5, Xbox and PC racing wheel bases
- Durable metal pedal arms with non-slip footplates$$),

    ('Thrustmaster Raceline LC Upgrade Kit', 'https://www.gameshop.my/cdn/shop/files/Slide1.png?v=1782665836&width=533', 719.00, 'ps5', false, '2026-06-11', 0,
$$- Load Cell brake upgrade kit for Thrustmaster Raceline pedal sets
- Delivers progressive, realistic brake pressure feedback
- Simple bolt-on installation, no extra tools required
- Ideal for sim racers seeking more precise braking control$$),

    ('Thrustmaster Raceline Pedals III LC', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsIIILC1.jpg?v=1782663942&width=533', 1054.00, 'ps5', false, '2026-05-30', 0,
$$- Premium 3-pedal set with factory-fitted Load Cell brake
- Fully adjustable pedal faces, travel and spring tension
- All-metal construction built for long-term durability
- Compatible with PS5, Xbox and PC platforms$$),

    ('Yakuza Kiwami 3 & Dark Ties (PS5)', 'https://www.gameshop.my/cdn/shop/files/PS5YakuzaKiwami3andDarkTies.jpg?v=1771084171&width=533', 239.00, 'ps5', false, '2026-05-18', 0,
$$- Remastered classic Yakuza story bundled with a new Dark Ties chapter
- Cinematic brawler combat set across Kamurocho and beyond
- Includes side stories, mini-games and substories
- Native PS5 enhancements for faster load times and visuals$$),

    ('Thrustmaster Formula Wheel Add-On Ferrari SF-25 Edition', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterFormulaWheelAdd-OnFerrariSF-25Edition1.jpg?v=1782574316&width=533', 2008.00, 'ps5', false, '2026-05-06', 0,
$$- Officially licensed Ferrari SF-25 Formula 1 replica wheel add-on
- Requires a compatible Thrustmaster wheel base (sold separately)
- Authentic button layout mirroring the real F1 steering wheel
- Premium materials for an immersive racing sim setup$$),

    ('Unknown 9 Awakening (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5Unknown9AwakeningAsia.jpg?v=1782498549&width=533', 192.00, 'ps5', false, '2026-04-24', 0,
$$- Action-adventure following Haroona, a Quaestor with reality-bending powers
- Combines melee combat with unique "Leap" ability mechanics
- Story spans hidden societies across the globe
- Asia region release for PS5$$),

    ('Final Fantasy VII Rebirth (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5FinalFantasyVIIRebirthAsia.jpg?v=1782273628&width=533', 179.00, 'ps5', false, '2026-04-12', 0,
$$- Second chapter of the Final Fantasy VII remake trilogy
- Expansive open-world exploration across an expanded map
- Real-time action combat with strategic party command
- Asia region release, PS5 exclusive$$),

    ('Fatal Fury: City Of The Wolves Special Edition (PS5)', 'https://www.gameshop.my/cdn/shop/files/PS5FatalFuryCityoftheWolvesSpecialEdition.jpg?v=1782216365&width=533', 149.00, 'ps5', false, '2026-03-31', 0,
$$- Latest entry in the classic Fatal Fury fighting game series
- Special Edition includes extra costumes and bonus content
- Rev system adds new offensive and defensive combat options
- Online ranked and casual matchmaking supported$$),

    ('Ghost of Yotei (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5GhostofYoteiAsia.jpg?v=1782098588&width=533', 286.00, 'ps5', false, '2026-03-19', 0,
$$- Open-world samurai action-adventure set around Mount Yotei
- Follows a new protagonist on a path of revenge
- Fluid sword combat blended with stealth and exploration
- Asia region release for PS5$$),

    ('PlayStation DualSense Edge Wireless Controller Midnight Black (Japan)', 'https://www.gameshop.my/cdn/shop/files/Photo1_d7919845-22fe-467b-8779-f5809719516a.jpg?v=1740581067&width=533', 907.00, 'ps5', false, '2026-03-07', 0,
$$- Pro-level wireless controller with customizable stick sensitivity
- Swappable back buttons and interchangeable stick caps
- Remappable buttons and adjustable trigger stop length
- Midnight Black colorway, Japan region packaging$$),

    ('SCUF Omega Wireless Performance Controller for PlayStation 5 and PC', 'https://www.gameshop.my/cdn/shop/files/SCUF_Omega_Wireless_Performance_Controller_Light_Gray_1.jpg?v=1782233780&width=533', 847.00, 'ps5', false, '2026-02-23', 0,
$$- Performance controller with rear paddles for faster inputs
- Adjustable trigger stops for quicker shot response
- Interchangeable thumbsticks for personalized grip and control
- Compatible with PS5 and PC$$),

    ('Turtle Beach Victrix Pro KO Fight Stick for PS5, PS4 and Windows Street Fighter II Champion Edition', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachVictrixProKOFightStickStreetFighterIIChampionEdition1.jpg?v=1781670429&width=533', 911.00, 'ps5', false, '2026-02-11', 36.91,
$$- Tournament-grade arcade fight stick with Street Fighter II branding
- Hot-swappable Sanwa-style joystick and buttons
- Compatible with PS5, PS4 and Windows PC
- Detachable cable and travel-friendly design$$),

    ('Turtle Beach Stealth Pro II Wireless Gaming Headset for Xbox, PC, PlayStation', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachStealthProIIXboxWhite.jpg?v=1781359843&width=533', 1263.00, 'ps5', false, '2026-01-30', 0,
$$- Flagship wireless gaming headset with active noise cancellation
- Swappable batteries for extended play sessions
- Cross-platform compatibility across Xbox, PC and PlayStation
- Adjustable, breathable memory foam ear cushions$$),

    ('Turtle Beach Stealth Pro II Wireless Gaming Headset for PC, PlayStation', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachStealthProIIPS5Black1.jpg?v=1781351667&width=533', 1263.00, 'ps5', false, '2026-01-18', 0,
$$- Flagship wireless gaming headset tuned for PlayStation and PC
- Active noise cancellation with superhuman hearing modes
- Long-lasting battery with hot-swappable pack support
- Premium comfort-fit ear cushions for long sessions$$),

    ('Split Fiction (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5SplitFictionAsia.jpg?v=1781198970&width=533', 185.00, 'ps5', false, '2026-01-06', 0,
$$- Co-op-focused adventure blending sci-fi and fantasy worlds
- Designed exclusively for two-player split-screen or online co-op
- Constantly shifting gameplay genres and mechanics per chapter
- Asia region release for PS5$$),

    ('PlayStation 5 Slim Console Digital Edition (Japan)', 'https://www.gameshop.my/cdn/shop/files/Photo_8db7a9b5-8330-4120-8b9e-e89bc435c5d7.jpg?v=1719557314&width=533', 2647.00, 'ps5', true, '2025-12-25', 0,
$$- Slimmer redesign of the PS5 console, digital edition (no disc drive)
- Custom SSD for near-instant load times
- Supports ray tracing and up to 4K/120fps output
- Japan region console$$),

    ('Black Myth Wukong (PS5/USA)', 'https://www.gameshop.my/cdn/shop/files/PS5BlackMythWukongUSA.jpg?v=1769000001&width=533', 298.00, 'ps5', false, '2025-12-01', 0,
$$- Action RPG inspired by the classic novel Journey to the West
- Fluid combo-driven combat with shapeshifting abilities
- Richly detailed mythological environments and boss encounters
- USA region release for PS5$$),

    ('Dead Island 2 Day One Edition (PS5)', 'https://www.gameshop.my/cdn/shop/files/PS5DeadIsland2DayOneEdition.jpg?v=1769000002&width=533', 163.00, 'ps5', false, '2025-11-19', 0,
$$- First-person zombie survival action set in a ravaged Los Angeles
- Visceral melee-focused combat with dismemberment system
- Day One Edition includes bonus in-game content
- Co-op play supported for up to 3 players$$),

    -- ===================== Nintendo Switch (17) =====================
    ('Tomodachi Life: Living The Dream (Nintendo Switch/Japan)', 'https://www.gameshop.my/cdn/shop/files/NSWTomodachiLifeLivingTheDreamJapan.jpg?v=1781077091&width=533', 228.00, 'switch', false, '2026-07-05', 0,
$$- Life-simulation sequel where Mii characters live on a shared island
- Sandbox-style social interactions, events and mini-games
- Deep customization of characters, homes and personalities
- Japan region release for Nintendo Switch$$),

    ('System Shock 2: 25th Anniversary Remaster (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWSystemShock225thAnniversaryRemaster.jpg?v=1780853079&width=533', 173.00, 'switch', false, '2026-06-23', 0,
$$- Remastered classic immersive sim horror RPG
- Updated visuals and controls for modern hardware
- Atmospheric sci-fi horror aboard the Von Braun spaceship
- 25th Anniversary bonus content included$$),

    ('The Disney Afternoon Collection (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWTheDisneyAfternoonCollection.jpg?v=1780829609&width=533', 182.00, 'switch', false, '2026-06-11', 0,
$$- Classic Disney NES-era platformers bundled in one collection
- Includes DuckTales, Chip 'n Dale Rescue Rangers and more
- Rewind, save states and museum art gallery features
- Nintendo Switch release$$),

    ('Akiba''s Trip: Hellbound & Debriefed (Nintendo Switch/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSWAkibasTripHellboundandDebriefed.jpg?v=1780767115&width=533', 100.00, 'switch', false, '2026-05-30', 0,
$$- Action RPG set in a vampire-infested Akihabara district
- Unique clothing-stripping combat mechanic to defeat enemies
- Explore a recreated real-world Tokyo shopping district
- Asia region release for Nintendo Switch$$),

    ('River City Saga: Journey to the West (Nintendo Switch/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSWRiverCitySagaJourneytotheWest.jpg?v=1780757913&width=533', 182.00, 'switch', false, '2026-05-18', 0,
$$- Beat-em-up RPG blending River City brawling with a Journey to the West story
- Multiple playable characters with distinct fighting styles
- Retro-inspired pixel art visuals
- Asia region release for Nintendo Switch$$),

    ('Ultimate Chicken Horse: A-Neigh-Versary Edition (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWUltimateChickenHorseA-Neigh-VersaryEdition.jpg?v=1780327175&width=533', 146.00, 'switch', false, '2026-05-06', 0,
$$- Party platformer where players build their own obstacle courses
- Local and online multiplayer for up to 4 players
- Anniversary edition adds new levels and traps
- Chaotic, sabotage-friendly couch co-op gameplay$$),

    ('Tomb Raider IV-VI Remastered (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWTombRaiderIV-VIRemastered.jpg?v=1780314853&width=533', 171.00, 'switch', false, '2026-04-24', 0,
$$- Remastered trilogy covering Tomb Raider IV, V and VI
- Updated visuals with option to toggle classic graphics
- Modernized controls alongside original tank-control option
- Classic Lara Croft puzzle-platforming adventures$$),

    ('Ghostbusters: Spirits Unleashed Ecto Edition (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWGhostbustersSpiritsUnleashedEctoEdition.jpg?v=1779897357&width=533', 168.00, 'switch', false, '2026-04-12', 0,
$$- Asymmetric multiplayer game pitting Ghostbusters against a ghost player
- Ecto Edition bundles extra cosmetic and equipment content
- Team-based ghost trapping objectives across iconic locations
- Online and local multiplayer support$$),

    ('Marvel vs Capcom Fighting Collection Arcade Classics (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/Photo1_2f552242-42d0-4580-b24f-ced29a63c5b4.jpg?v=1732297239&width=533', 157.00, 'switch', false, '2026-03-31', 0,
$$- Collection of classic Marvel vs Capcom arcade fighting games
- Online play, rollback netcode and training tools
- Includes bonus art galleries and museum content
- Faithful arcade-accurate recreations$$),

    ('Marvel Cosmic Invasion (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWMarvelCosmicInvasion_32c14b60-e6d3-41cb-9f8d-e616b8161c86.jpg?v=1779561802&width=533', 210.00, 'switch', false, '2026-03-19', 0,
$$- Retro-style beat-em-up starring classic Marvel superheroes
- Up to 4-player local and online co-op
- Combo-driven brawling across iconic Marvel locations
- Pixel-art visuals inspired by 90s arcade brawlers$$),

    ('NBA 2K26 (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/Photo4_ef736ae6-3e0a-46e6-ab25-d9d2c60425d4.jpg?v=1757159896&width=533', 139.00, 'switch', false, '2026-03-07', 0,
$$- Latest entry in the NBA 2K basketball simulation series
- MyCareer, MyTeam and full league franchise modes
- Updated rosters and gameplay tuning for the new season
- Online multiplayer matches supported$$),

    ('Dynasty Warriors 9 Empires (Nintendo Switch/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSWDynastyWarriors9EmpiresAsia.jpg?v=1779557735&width=533', 235.00, 'switch', false, '2026-02-23', 0,
$$- Hack-and-slash strategy game set in Romance of the Three Kingdoms era
- Large-scale battles against hundreds of enemies on screen
- Empire management layered on top of action combat
- Asia region release for Nintendo Switch$$),

    ('Romancing Saga 2 Revenge of the Seven (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWRomancingSaga2RevengeoftheSeven.jpg?v=1779138199&width=533', 168.00, 'switch', false, '2026-02-11', 0,
$$- Remake of the classic Romancing SaGa 2 RPG
- Non-linear storyline spanning generations of rulers
- Free-form skill growth and dynamic battle system
- Updated visuals and quality-of-life improvements$$),

    ('Super Mario RPG (Nintendo Switch/Japan)', 'https://www.gameshop.my/cdn/shop/files/NSWSuperMarioRPGJapan.jpg?v=1778434749&width=533', 139.00, 'switch', false, '2026-01-30', 0,
$$- Remake of the beloved Super Mario RPG classic
- Turn-based combat with timed action-command inputs
- Fully updated 3D visuals and remastered soundtrack
- Japan region release for Nintendo Switch$$),

    ('Genki Covert Dock 3', 'https://www.gameshop.my/cdn/shop/files/GenkiConvertDock3.jpg?v=1778318973&width=533', 239.00, 'switch', true, '2026-01-18', 0,
$$- Compact portable docking station for handheld consoles
- Outputs up to 4K video to an external display
- Built-in cooling fan to prevent overheating during docked play
- Lightweight, travel-friendly design$$),

    ('Nintendo Switch Console OLED (Asia)', 'https://www.gameshop.my/cdn/shop/products/Shopify_9d5aef06-ca8b-4c6a-9c97-dee9f1872639.jpg?v=1638699152&width=533', 1359.00, 'switch', true, '2026-01-06', 0,
$$- Nintendo Switch console with vibrant 7-inch OLED screen
- Enhanced audio and a wide adjustable kickstand
- Play docked on TV, tabletop or handheld
- Asia region console$$),

    ('Elgato Stream Deck Neo (Switch Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'switch', false, '2025-12-25', 0,
$$- Compact stream control deck with customizable LCD keys
- Info display panel for time, date and app status
- Plug-and-play setup with Elgato's Stream Deck software
- Great for streamers and content creators$$),

    -- ===================== Xbox (16) =====================
    ('Xbox Wireless Controller Forza Horizon 6 (Asia)', 'https://www.gameshop.my/cdn/shop/files/XboxWirelessGamingControllerForzaHorizon6.jpg?v=1781544642&width=533', 377.00, 'xbox', false, '2026-07-05', 0,
$$- Limited-edition wireless controller themed around Forza Horizon 6
- Textured grip and hybrid D-pad for precise inputs
- Compatible with Xbox consoles, PC and mobile
- Asia region packaging$$),

    ('Genki ShadowCast 3 Pro', 'https://www.gameshop.my/cdn/shop/files/GenkiShadowCast3Pro1.jpg?v=1776530810&width=533', 264.00, 'xbox', false, '2026-06-23', 0,
$$- Compact capture card for streaming and recording console gameplay
- Supports up to 4K passthrough with low input lag
- Plug-and-play compatibility with PC, Mac and mobile
- Pairs well with Xbox, PlayStation and Switch consoles$$),

    ('ASUS ROG Raikiri II Xbox Wireless Controller', 'https://www.gameshop.my/cdn/shop/files/ASUSROGRaikiriIIXboxWirelessController1.jpg?v=1776013356&width=533', 796.00, 'xbox', true, '2026-06-11', 0,
$$- Premium wireless controller with rear paddles and a small OLED display
- Onboard button remapping and profile switching
- Hall-effect analog sticks for reduced stick drift
- Officially licensed for Xbox and PC$$),

    ('Playseat Challenge DD F1 Edition', 'https://www.gameshop.my/cdn/shop/files/PlayseatChallengeDDF1Edition1.jpg?v=1773985815&width=533', 1714.00, 'xbox', true, '2026-05-30', 0,
$$- Foldable racing simulator seat with official F1 branding
- Compatible with most steering wheels and pedal sets
- Sturdy tubular steel frame for stable direct-drive racing
- Folds flat for easy storage between sessions$$),

    ('ASUS ROG Delta II Gaming Headset', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIGamingHeadsetBlack1.jpg?v=1771318596&width=533', 976.00, 'xbox', false, '2026-05-06', 0,
$$- High-fidelity gaming headset with quad-DAC audio processing
- ANC microphone for clear, noise-free voice chat
- Comfortable memory foam ear cushions for long sessions
- Compatible with Xbox, PC and mobile devices$$),

    ('ASUS ROG Delta II Gaming Headset Kojima Productions White', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIKJPGamingHeadsetWhite1.jpg?v=1771257833&width=533', 1290.00, 'xbox', false, '2026-04-24', 0,
$$- Kojima Productions collaboration edition of the ROG Delta II headset
- Quad-DAC driven audio with customizable EQ profiles
- Exclusive white colorway with Kojima Productions branding
- ANC microphone for clear voice communication$$),

    ('GuliKit 720° Adjustable Tension TMR Magnetic Joystick Replacement Kit', 'https://www.gameshop.my/cdn/shop/files/Gulikit720TensionAdjustableTMRJoystick.jpg?v=1771074949&width=533', 91.00, 'xbox', false, '2026-04-12', 0,
$$- Magnetic Hall-effect joystick replacement kit to eliminate stick drift
- Adjustable tension for a customized stick feel
- 720-degree rotation range for smoother analog input
- Designed as a repair upgrade for compatible controllers$$),

    ('Turtle Beach Victrix Pro BFG Wireless Gaming Controller for Xbox and Windows', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachVictrixProBFGWirelessControllerforXbox1.jpg?v=1770741279&width=533', 589.00, 'xbox', false, '2026-03-31', 29.80,
$$- Modular wireless controller with swappable component pieces
- Interchangeable thumbsticks, D-pads and back buttons
- Remappable rear paddles for competitive play
- Compatible with Xbox consoles and Windows PC$$),

    ('8BitDo Ultimate 3-Mode Controller with Charging Dock for Xbox Rare 40th Anniversary Edition', 'https://www.gameshop.my/cdn/shop/files/8BitDoUltimate3-modeWirelessControllerforXboxRare40thAnniversary1.jpg?v=1770190325&width=533', 274.00, 'xbox', false, '2026-03-19', 0,
$$- Special Rare 40th Anniversary themed wireless controller
- Includes a charging dock for convenient storage and charging
- 3-mode connectivity: Bluetooth, 2.4GHz and wired
- Hall-effect sticks and remappable back buttons$$),

    ('Razer Barracuda Wireless Gaming Headset', 'https://www.gameshop.my/cdn/shop/files/RazerBarracudaWirelessGamingHeadsetBlack.jpg?v=1770133499&width=533', 503.00, 'xbox', false, '2026-03-07', 0,
$$- Dual wireless connectivity for gaming and mobile use
- Lightweight design with breathable ear cushions
- Long battery life for extended multi-day use
- Broad platform compatibility including Xbox and PC$$),

    ('Thrustmaster Raceline Pedals LTE (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsLTE1.jpg?v=1783175768&width=533', 497.00, 'xbox', false, '2026-02-23', 0,
$$- Entry-level 3-pedal set (throttle, brake, clutch) for sim racing
- Adjustable pedal spacing and resistance for custom feel
- Compatible with Xbox, PS5 and PC racing wheel bases
- Durable metal pedal arms with non-slip footplates$$),

    ('Thrustmaster Raceline LC Upgrade Kit (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/Slide1.png?v=1782665836&width=533', 719.00, 'xbox', false, '2026-02-11', 0,
$$- Load Cell brake upgrade kit for Thrustmaster Raceline pedal sets
- Delivers progressive, realistic brake pressure feedback
- Simple bolt-on installation, no extra tools required
- Ideal for sim racers seeking more precise braking control$$),

    ('Thrustmaster Raceline Pedals III LC (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsIIILC1.jpg?v=1782663942&width=533', 1054.00, 'xbox', false, '2026-01-30', 0,
$$- Premium 3-pedal set with factory-fitted Load Cell brake
- Fully adjustable pedal faces, travel and spring tension
- All-metal construction built for long-term durability
- Compatible with Xbox, PS5 and PC platforms$$),

    ('Thrustmaster Formula Wheel Add-On Ferrari SF-25 Edition (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterFormulaWheelAdd-OnFerrariSF-25Edition1.jpg?v=1782574316&width=533', 2008.00, 'xbox', false, '2026-01-18', 0,
$$- Officially licensed Ferrari SF-25 Formula 1 replica wheel add-on
- Requires a compatible Thrustmaster wheel base (sold separately)
- Authentic button layout mirroring the real F1 steering wheel
- Premium materials for an immersive racing sim setup$$),

    ('Turtle Beach Stealth Pro II Wireless Gaming Headset for Xbox, PC, PlayStation (Xbox Listing)', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachStealthProIIXboxWhite.jpg?v=1781359843&width=533', 1263.00, 'xbox', false, '2026-01-06', 0,
$$- Flagship wireless gaming headset with active noise cancellation
- Swappable batteries for extended play sessions
- Cross-platform compatibility across Xbox, PC and PlayStation
- Adjustable, breathable memory foam ear cushions$$),

    ('Xbox Series X Console 1TB Digital White (Japan)', 'https://www.gameshop.my/cdn/shop/files/Photo1_7cd738d0-324d-4e73-b616-118e6a305ce3.jpg?v=1733761325&width=533', 2720.00, 'xbox', true, '2025-12-25', 0,
$$- Xbox Series X console, digital edition (no disc drive)
- 1TB internal SSD storage for fast load times
- Supports up to 4K/120fps and ray tracing
- Japan region console, White colorway$$),

    -- ===================== PS4 (16) =====================
    ('Harvest Moon Light of Hope Complete Special Edition (PS4)', 'https://www.gameshop.my/cdn/shop/files/PS4HarvestMoonLightofHopeCompleteSpecialEdition.jpg?v=1779137978&width=533', 111.00, 'ps4', false, '2026-07-05', 0,
$$- Farming and life simulation set on a storm-battered island
- Complete Special Edition bundles all previously released DLC
- Grow crops, raise animals and rebuild the local lighthouse
- Relaxed, story-driven farming sim gameplay$$),

    ('Thrustmaster GT Wheel Add-On', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterGTWheelAdd-On1.jpg?v=1778955313&width=533', 1448.00, 'ps4', false, '2026-06-23', 0,
$$- GT-style racing wheel add-on for compatible wheel bases
- Authentic racing wheel rim design and grip texture
- Requires a compatible Thrustmaster base (sold separately)
- Built for immersive racing simulation setups$$),

    ('Crysis Remastered Trilogy (PS4)', 'https://www.gameshop.my/cdn/shop/files/PS4CrysisRemasteredTrilogy.jpg?v=1777136946&width=533', 132.00, 'ps4', false, '2026-06-11', 0,
$$- Remastered collection of Crysis, Crysis 2 and Crysis 3
- Upgraded visuals, textures and lighting across all three games
- Nanosuit-powered sandbox FPS combat
- Full single-player campaigns included$$),

    ('Call of Duty: Black Ops 7 (PS4)', 'https://www.gameshop.my/cdn/shop/files/PS4CallOfDutyBlackOps7.jpg?v=1777136547&width=533', 214.00, 'ps4', false, '2026-05-30', 0,
$$- Latest entry in the Black Ops first-person shooter series
- Includes campaign, multiplayer and Zombies modes
- Fast-paced competitive online multiplayer maps
- Available on PS4$$),

    ('Genki ShadowCast 3 Pro (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/GenkiShadowCast3Pro1.jpg?v=1776530810&width=533', 264.00, 'ps4', false, '2026-05-18', 0,
$$- Compact capture card for streaming and recording console gameplay
- Supports up to 4K passthrough with low input lag
- Plug-and-play compatibility with PC, Mac and mobile
- Pairs well with PS4, Xbox and Switch consoles$$),

    ('ASUS ROG Cetra Open Wireless Gaming Earbuds', 'https://www.gameshop.my/cdn/shop/files/ROGCetraOpenWirelessGamingEarbuds1.jpg?v=1774322824&width=533', 870.00, 'ps4', true, '2026-05-06', 0,
$$- Open-ear wireless gaming earbuds for low-latency audio
- Comfortable, secure fit for long gaming sessions
- Dual wireless connectivity for gaming and everyday use
- Built-in microphone for voice chat clarity$$),

    ('Playseat Challenge DD F1 Edition (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/PlayseatChallengeDDF1Edition1.jpg?v=1773985815&width=533', 1714.00, 'ps4', false, '2026-04-24', 0,
$$- Foldable racing simulator seat with official F1 branding
- Compatible with most steering wheels and pedal sets
- Sturdy tubular steel frame for stable direct-drive racing
- Folds flat for easy storage between sessions$$),

    ('ASUS ROG Delta II Gaming Headset (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIGamingHeadsetBlack1.jpg?v=1771318596&width=533', 939.00, 'ps4', false, '2026-03-31', 0,
$$- High-fidelity gaming headset with quad-DAC audio processing
- ANC microphone for clear, noise-free voice chat
- Comfortable memory foam ear cushions for long sessions
- Compatible with PS4, PC and mobile devices$$),

    ('ASUS ROG Delta II Gaming Headset Kojima Productions White (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIKJPGamingHeadsetWhite1.jpg?v=1771257833&width=533', 1290.00, 'ps4', false, '2026-03-19', 0,
$$- Kojima Productions collaboration edition of the ROG Delta II headset
- Quad-DAC driven audio with customizable EQ profiles
- Exclusive white colorway with Kojima Productions branding
- ANC microphone for clear voice communication$$),

    ('GuliKit 720° Adjustable Tension TMR Magnetic Joystick Replacement Kit (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/Gulikit720TensionAdjustableTMRJoystick.jpg?v=1771074949&width=533', 91.00, 'ps4', false, '2026-03-07', 0,
$$- Magnetic Hall-effect joystick replacement kit to eliminate stick drift
- Adjustable tension for a customized stick feel
- 720-degree rotation range for smoother analog input
- Designed as a repair upgrade for compatible controllers$$),

    ('Razer Barracuda Wireless Gaming Headset (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/RazerBarracudaWirelessGamingHeadsetBlack.jpg?v=1770133499&width=533', 496.00, 'ps4', false, '2026-02-23', 0,
$$- Dual wireless connectivity for gaming and mobile use
- Lightweight design with breathable ear cushions
- Long battery life for extended multi-day use
- Broad platform compatibility including PS4 and PC$$),

    ('Street Fighter 6 Years 1-2 Fighters Edition (PS4/Asia)', 'https://www.gameshop.my/cdn/shop/files/Photo1_bd1f6388-29b3-4599-96ed-0d620932ed96.jpg?v=1749232743&width=533', 223.00, 'ps4', false, '2026-02-11', 0,
$$- Bundles Street Fighter 6 base game with two years of DLC fighters
- Includes World Tour, Fighting Ground and Battle Hub modes
- Deep, technical fighting game mechanics with Drive System
- Asia region release for PS4$$),

    ('Playseat Brake Pedal', 'https://www.gameshop.my/cdn/shop/files/PlayseatBrakePedal1.jpg?v=1769533797&width=533', 157.00, 'ps4', false, '2026-01-30', 0,
$$- Standalone brake pedal accessory for racing simulator rigs
- Adjustable resistance for progressive brake feel
- Durable metal construction with non-slip footplate
- Compatible with most Playseat racing rig setups$$),

    ('Turtle Beach Victrix Pro BFG Reloaded Wireless Gaming Controller for PS5, PS4 and Windows', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachVictrixProBFGReloadedWirelessControllerPS5Black.jpg?v=1769263576&width=533', 846.00, 'ps4', false, '2026-01-18', 0,
$$- Modular wireless controller with swappable component pieces
- Interchangeable thumbsticks, D-pads and back buttons
- Remappable rear paddles for competitive play
- Compatible with PS5, PS4 and Windows PC$$),

    ('Playstation Network Card USD100 - Digital Download', 'https://www.gameshop.my/cdn/shop/files/PSNCardUSD100.jpg?v=1769253330&width=533', 509.00, 'ps4', false, '2026-01-06', 0,
$$- USD 100 PlayStation Network wallet top-up
- Redeemable on the PlayStation Store for games, DLC and subscriptions
- Delivered as a digital code, no physical shipping required
- Valid on PS4, PS5 and PSN accounts$$),

    ('Call of Duty Black Ops 6 (PS4/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS4CallOfDutyBlackOps6.jpg?v=1769000003&width=533', 267.00, 'ps4', false, '2025-12-25', 0,
$$- Black Ops era first-person shooter with campaign and multiplayer
- Includes Zombies co-op mode alongside competitive multiplayer
- Asia region release for PS4
- Fast-paced, movement-focused combat systems$$),

    -- ===================== Nintendo Switch 2 (18) =====================
    ('The Disney Afternoon Collection (Nintendo Switch 2)', 'https://www.gameshop.my/cdn/shop/files/NSW2TheDisneyAfternoonCollection.jpg?v=1780828742&width=533', 205.00, 'switch_2', false, '2026-07-05', 0,
$$- Classic Disney NES-era platformers bundled in one collection
- Includes DuckTales, Chip 'n Dale Rescue Rangers and more
- Rewind, save states and museum art gallery features
- Optimized for Nintendo Switch 2$$),

    ('The Rogue Prince of Persia (Nintendo Switch 2)', 'https://www.gameshop.my/cdn/shop/files/NSW2TheRoguePrinceofPersia.jpg?v=1780759166&width=533', 173.00, 'switch_2', false, '2026-06-23', 0,
$$- Roguelite action-platformer set in the Prince of Persia universe
- Fast, acrobatic combat with procedurally varied runs
- Permanent progression unlocks across repeated attempts
- Hand-drawn art style with fluid animation$$),

    ('Final Fantasy VII Rebirth (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2FinalFantasyVIIRebirth.jpg?v=1780751051&width=533', 187.00, 'switch_2', false, '2026-06-11', 0,
$$- Second chapter of the Final Fantasy VII remake trilogy
- Expansive open-world exploration across an expanded map
- Real-time action combat with strategic party command
- Asia region release for Nintendo Switch 2$$),

    ('Dragon Quest VII Reimagined (Nintendo Switch 2)', 'https://www.gameshop.my/cdn/shop/files/NSW2DragonQuestVIIReimagined.jpg?v=1770389352&width=533', 224.00, 'switch_2', false, '2026-05-30', 0,
$$- Reimagined version of the classic Dragon Quest VII RPG
- Turn-based combat with a large cast of vocations and monsters
- Island-hopping exploration and world-restoring storyline
- Updated visuals for modern hardware$$),

    ('Lollipop Chainsaw RePOP (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2LollipopChainsawRePOP.jpg?v=1780161282&width=533', 232.00, 'switch_2', false, '2026-05-18', 0,
$$- Remaster of the cult classic zombie hack-and-slash
- Combo-driven chainsaw combat with cheerleader protagonist
- Updated visuals, audio and quality-of-life improvements
- Asia region release for Nintendo Switch 2$$),

    ('Nintendo Switch 2 Pro Controller Resident Evil Requiem Edition (Japan)', 'https://www.gameshop.my/cdn/shop/files/NSW2ProControllerResidentEvilRequiem1.jpg?v=1772139837&width=533', 360.00, 'switch_2', false, '2026-05-06', 0,
$$- Officially licensed Resident Evil Requiem themed Pro Controller
- Ergonomic grip designed for extended play sessions
- Full motion controls and amiibo-compatible NFC reader
- Japan region packaging$$),

    ('Nintendo Switch 2 Joy-Con 2 L/R Light Purple/Light Green (Japan)', 'https://www.gameshop.my/cdn/shop/files/NintendoSwitch2Joy-Con2LRLightPurpleLightGreen1.jpg?v=1770829830&width=533', 328.00, 'switch_2', false, '2026-04-24', 0,
$$- Official Joy-Con 2 controller pair for Nintendo Switch 2
- Light Purple and Light Green colorway
- Magnetic attachment with improved mouse-mode functionality
- Japan region packaging$$),

    ('Cyberpunk 2077 Ultimate Edition (Nintendo Switch 2/Japan)', 'https://www.gameshop.my/cdn/shop/files/NSW2Cyberpunk2077UltimateEditionJapan.jpg?v=1779891490&width=533', 258.00, 'switch_2', false, '2026-04-12', 0,
$$- Open-world action RPG set in the dystopian Night City
- Ultimate Edition bundles the base game and Phantom Liberty expansion
- Deep character customization and branching narrative choices
- Japan region release for Nintendo Switch 2$$),

    ('Nyko Joy-Con Charge Dock for Nintendo Switch 2', 'https://www.gameshop.my/cdn/shop/files/NykoChargeDockforSwitch21.jpg?v=1779527670&width=533', 121.00, 'switch_2', false, '2026-03-31', 0,
$$- Charging dock designed for Nintendo Switch 2 Joy-Con controllers
- Charges both Joy-Cons simultaneously via USB
- LED indicators show charging status at a glance
- Compact desktop-friendly footprint$$),

    ('NBA 2K26 (Nintendo Switch 2/Europe)', 'https://www.gameshop.my/cdn/shop/files/Photo3_b70bcb3a-87ee-491e-bfc0-cb916d532679.jpg?v=1757159982&width=533', 143.00, 'switch_2', false, '2026-03-19', 0,
$$- Latest entry in the NBA 2K basketball simulation series
- MyCareer, MyTeam and full league franchise modes
- Updated rosters and gameplay tuning for the new season
- Europe region release for Nintendo Switch 2$$),

    ('Yoshi And The Mysterious Book (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2YoshiAndTheMysteriousBook.jpg?v=1779343628&width=533', 285.00, 'switch_2', false, '2026-03-07', 0,
$$- Cooperative platformer starring Yoshi in a storybook world
- Craft-style visuals with page-flipping level transitions
- Local co-op play for up to two players
- Asia region release for Nintendo Switch 2$$),

    ('Tales of Arise Beyond The Dawn (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2TalesOfAriseBeyondTheDawnEdition.jpg?v=1779339250&width=533', 200.00, 'switch_2', false, '2026-02-23', 0,
$$- Enhanced edition of the acclaimed Tales of Arise RPG
- Includes the Beyond the Dawn story expansion
- Fast-paced real-time combat with elemental Artes
- Asia region release for Nintendo Switch 2$$),

    ('Nyko Gamer Dock for Nintendo Switch 2', 'https://www.gameshop.my/cdn/shop/files/NSW2NYKOGamerDock1.jpg?v=1779209090&width=533', 224.00, 'switch_2', false, '2026-02-11', 0,
$$- Compact TV docking station for Nintendo Switch 2
- Outputs video directly to a connected display
- Built-in cooling to support extended docked play
- Space-saving alternative to the official dock$$),

    ('Hori Mario Kart Racing Wheel Pro Mini for Nintendo Switch 2', 'https://www.gameshop.my/cdn/shop/files/HoriMarioKartRacingWheelProMiniforNintendoSwitch21.jpg?v=1779078919&width=533', 363.00, 'switch_2', false, '2026-01-30', 0,
$$- Compact racing wheel accessory themed around Mario Kart
- Attaches to Joy-Con controllers for wheel-style steering
- Officially licensed by Nintendo
- Lightweight, portable design for on-the-go racing$$),

    ('Indiana Jones and The Great Circle (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2IndianaJonesandtheGreatCircle.jpg?v=1778821259&width=533', 278.00, 'switch_2', false, '2026-01-18', 0,
$$- First-person action-adventure starring Indiana Jones
- Blends puzzle-solving, exploration and stealth-based combat
- Globe-trotting storyline inspired by classic adventure films
- Asia region release for Nintendo Switch 2$$),

    ('Genki Covert Dock 3 (Switch 2 Listing)', 'https://www.gameshop.my/cdn/shop/files/GenkiConvertDock3.jpg?v=1778318973&width=533', 239.00, 'switch_2', true, '2026-01-06', 0,
$$- Compact portable docking station for handheld consoles
- Outputs up to 4K video to an external display
- Built-in cooling fan to prevent overheating during docked play
- Lightweight, travel-friendly design$$),

    ('Nintendo Switch 2 Console (Asia)', 'https://www.gameshop.my/cdn/shop/files/Photo1_1d11f4ba-ad22-434b-8504-8375baff191e.jpg?v=1757695616&width=533', 2348.00, 'switch_2', true, '2025-12-25', 0,
$$- Next-generation Nintendo Switch 2 hybrid console
- Larger display with improved performance over the original Switch
- Play docked on TV, tabletop or handheld
- Asia region console$$),

    ('Elgato Stream Deck Neo (Switch 2 Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'switch_2', false, '2025-12-13', 0,
$$- Compact stream control deck with customizable LCD keys
- Info display panel for time, date and app status
- Plug-and-play setup with Elgato's Stream Deck software
- Great for streamers and content creators$$)

    RETURNING product_id, name, cover_image_url, is_sold_out
)
INSERT INTO product_variations (product_id, label, image_url, image_public_id, stock, price_offset)
SELECT
    product_id,
    'Standard',
    cover_image_url,
    'seed_placeholder_' || product_id,
    CASE WHEN is_sold_out THEN 0 ELSE (floor(random() * 50) + 1)::int END,
    0.00
FROM inserted_products;

COMMIT;
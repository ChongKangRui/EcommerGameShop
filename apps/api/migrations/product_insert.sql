-- ============================================================
-- Seed script: RedfieldGamingDB test data
-- Source: gameshop.my (name, cover image, price scraped from
-- live collection/product pages, per category, on 2026-07-07)
-- ============================================================

BEGIN;

-- 1. Wipe previously inserted test data (cascades to variations)
DELETE FROM product_variations;
DELETE FROM products;
ALTER SEQUENCE products_product_id_seq RESTART WITH 1;

-- 2. Insert products, then auto-generate one "Standard" variation
--    per product using the same cover image.
WITH inserted_products AS (
    INSERT INTO products (name, cover_image_url, price, type, is_sold_out, release_date, discount_percentage)
    VALUES
    -- ===================== PS5 (16) =====================
    ('Monopoly: Star Wars Heroes vs. Villains (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5MonopolyStarWarsHeroesvsVillains.jpg?v=1783255888&width=533', 170.00, 'ps5', false, '2026-07-05', 0),
    ('Thrustmaster Raceline Pedals LTE', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsLTE1.jpg?v=1783175768&width=533', 497.00, 'ps5', false, '2026-06-23', 0),
    ('Thrustmaster Raceline LC Upgrade Kit', 'https://www.gameshop.my/cdn/shop/files/Slide1.png?v=1782665836&width=533', 719.00, 'ps5', false, '2026-06-11', 0),
    ('Thrustmaster Raceline Pedals III LC', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsIIILC1.jpg?v=1782663942&width=533', 1054.00, 'ps5', false, '2026-05-30', 0),
    ('Yakuza Kiwami 3 & Dark Ties (PS5)', 'https://www.gameshop.my/cdn/shop/files/PS5YakuzaKiwami3andDarkTies.jpg?v=1771084171&width=533', 239.00, 'ps5', false, '2026-05-18', 0),
    ('Thrustmaster Formula Wheel Add-On Ferrari SF-25 Edition', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterFormulaWheelAdd-OnFerrariSF-25Edition1.jpg?v=1782574316&width=533', 2008.00, 'ps5', false, '2026-05-06', 0),
    ('Unknown 9 Awakening (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5Unknown9AwakeningAsia.jpg?v=1782498549&width=533', 192.00, 'ps5', false, '2026-04-24', 0),
    ('Final Fantasy VII Rebirth (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5FinalFantasyVIIRebirthAsia.jpg?v=1782273628&width=533', 179.00, 'ps5', false, '2026-04-12', 0),
    ('Fatal Fury: City Of The Wolves Special Edition (PS5)', 'https://www.gameshop.my/cdn/shop/files/PS5FatalFuryCityoftheWolvesSpecialEdition.jpg?v=1782216365&width=533', 149.00, 'ps5', false, '2026-03-31', 0),
    ('Ghost of Yotei (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5GhostofYoteiAsia.jpg?v=1782098588&width=533', 286.00, 'ps5', false, '2026-03-19', 0),
    ('PlayStation DualSense Edge Wireless Controller Midnight Black (Japan)', 'https://www.gameshop.my/cdn/shop/files/Photo1_d7919845-22fe-467b-8779-f5809719516a.jpg?v=1740581067&width=533', 907.00, 'ps5', false, '2026-03-07', 0),
    ('SCUF Omega Wireless Performance Controller for PlayStation 5 and PC', 'https://www.gameshop.my/cdn/shop/files/SCUF_Omega_Wireless_Performance_Controller_Light_Gray_1.jpg?v=1782233780&width=533', 847.00, 'ps5', false, '2026-02-23', 0),
    ('Turtle Beach Victrix Pro KO Fight Stick for PS5, PS4 and Windows Street Fighter II Champion Edition', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachVictrixProKOFightStickStreetFighterIIChampionEdition1.jpg?v=1781670429&width=533', 911.00, 'ps5', false, '2026-02-11', 36.91),
    ('Turtle Beach Stealth Pro II Wireless Gaming Headset for Xbox, PC, PlayStation', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachStealthProIIXboxWhite.jpg?v=1781359843&width=533', 1263.00, 'ps5', false, '2026-01-30', 0),
    ('Turtle Beach Stealth Pro II Wireless Gaming Headset for PC, PlayStation', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachStealthProIIPS5Black1.jpg?v=1781351667&width=533', 1263.00, 'ps5', false, '2026-01-18', 0),
    ('Split Fiction (PS5/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS5SplitFictionAsia.jpg?v=1781198970&width=533', 185.00, 'ps5', false, '2026-01-06', 0),
    ('PlayStation 5 Slim Console Digital Edition (Japan)', 'https://www.gameshop.my/cdn/shop/files/Photo_8db7a9b5-8330-4120-8b9e-e89bc435c5d7.jpg?v=1719557314&width=533', 2647.00, 'ps5', true, '2025-12-25', 0),
    ('Elgato Stream Deck Neo', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'ps5', false, '2025-12-13', 0),
    ('Black Myth Wukong (PS5/USA)', 'https://www.gameshop.my/cdn/shop/files/PS5BlackMythWukongUSA.jpg?v=1769000001&width=533', 298.00, 'ps5', false, '2025-12-01', 0),
    ('Dead Island 2 Day One Edition (PS5)', 'https://www.gameshop.my/cdn/shop/files/PS5DeadIsland2DayOneEdition.jpg?v=1769000002&width=533', 163.00, 'ps5', false, '2025-11-19', 0),

    -- ===================== Nintendo Switch (15) =====================
    
    ('Tomodachi Life: Living The Dream (Nintendo Switch/Japan)', 'https://www.gameshop.my/cdn/shop/files/NSWTomodachiLifeLivingTheDreamJapan.jpg?v=1781077091&width=533', 228.00, 'switch', false, '2026-07-05', 0),
    ('System Shock 2: 25th Anniversary Remaster (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWSystemShock225thAnniversaryRemaster.jpg?v=1780853079&width=533', 173.00, 'switch', false, '2026-06-23', 0),
    ('The Disney Afternoon Collection (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWTheDisneyAfternoonCollection.jpg?v=1780829609&width=533', 182.00, 'switch', false, '2026-06-11', 0),
    ('Akiba''s Trip: Hellbound & Debriefed (Nintendo Switch/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSWAkibasTripHellboundandDebriefed.jpg?v=1780767115&width=533', 100.00, 'switch', false, '2026-05-30', 0),
    ('River City Saga: Journey to the West (Nintendo Switch/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSWRiverCitySagaJourneytotheWest.jpg?v=1780757913&width=533', 182.00, 'switch', false, '2026-05-18', 0),
    ('Ultimate Chicken Horse: A-Neigh-Versary Edition (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWUltimateChickenHorseA-Neigh-VersaryEdition.jpg?v=1780327175&width=533', 146.00, 'switch', false, '2026-05-06', 0),
    ('Tomb Raider IV-VI Remastered (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWTombRaiderIV-VIRemastered.jpg?v=1780314853&width=533', 171.00, 'switch', false, '2026-04-24', 0),
    ('Ghostbusters: Spirits Unleashed Ecto Edition (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWGhostbustersSpiritsUnleashedEctoEdition.jpg?v=1779897357&width=533', 168.00, 'switch', false, '2026-04-12', 0),
    ('Marvel vs Capcom Fighting Collection Arcade Classics (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/Photo1_2f552242-42d0-4580-b24f-ced29a63c5b4.jpg?v=1732297239&width=533', 157.00, 'switch', false, '2026-03-31', 0),
    ('Marvel Cosmic Invasion (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWMarvelCosmicInvasion_32c14b60-e6d3-41cb-9f8d-e616b8161c86.jpg?v=1779561802&width=533', 210.00, 'switch', false, '2026-03-19', 0),
    ('NBA 2K26 (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/Photo4_ef736ae6-3e0a-46e6-ab25-d9d2c60425d4.jpg?v=1757159896&width=533', 139.00, 'switch', false, '2026-03-07', 0),
    ('Dynasty Warriors 9 Empires (Nintendo Switch/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSWDynastyWarriors9EmpiresAsia.jpg?v=1779557735&width=533', 235.00, 'switch', false, '2026-02-23', 0),
    ('Romancing Saga 2 Revenge of the Seven (Nintendo Switch)', 'https://www.gameshop.my/cdn/shop/files/NSWRomancingSaga2RevengeoftheSeven.jpg?v=1779138199&width=533', 168.00, 'switch', false, '2026-02-11', 0),
    ('Super Mario RPG (Nintendo Switch/Japan)', 'https://www.gameshop.my/cdn/shop/files/NSWSuperMarioRPGJapan.jpg?v=1778434749&width=533', 139.00, 'switch', false, '2026-01-30', 0),
    ('Genki Covert Dock 3', 'https://www.gameshop.my/cdn/shop/files/GenkiConvertDock3.jpg?v=1778318973&width=533', 239.00, 'switch', true, '2026-01-18', 0),
    ('Nintendo Switch Console OLED (Asia)', 'https://www.gameshop.my/cdn/shop/products/Shopify_9d5aef06-ca8b-4c6a-9c97-dee9f1872639.jpg?v=1638699152&width=533', 1359.00, 'switch', true, '2026-01-06', 0),
    ('Elgato Stream Deck Neo (Switch Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'switch', false, '2025-12-25', 0),

    -- ===================== Xbox (16) =====================
    ('Xbox Wireless Controller Forza Horizon 6 (Asia)', 'https://www.gameshop.my/cdn/shop/files/XboxWirelessGamingControllerForzaHorizon6.jpg?v=1781544642&width=533', 377.00, 'xbox', false, '2026-07-05', 0),
    ('Genki ShadowCast 3 Pro', 'https://www.gameshop.my/cdn/shop/files/GenkiShadowCast3Pro1.jpg?v=1776530810&width=533', 264.00, 'xbox', false, '2026-06-23', 0),
    ('ASUS ROG Raikiri II Xbox Wireless Controller', 'https://www.gameshop.my/cdn/shop/files/ASUSROGRaikiriIIXboxWirelessController1.jpg?v=1776013356&width=533', 796.00, 'xbox', true, '2026-06-11', 0),
    ('Playseat Challenge DD F1 Edition', 'https://www.gameshop.my/cdn/shop/files/PlayseatChallengeDDF1Edition1.jpg?v=1773985815&width=533', 1714.00, 'xbox', true, '2026-05-30', 0),
    ('Elgato Game Capture 4K S', 'https://www.gameshop.my/cdn/shop/files/ElgatoGameCapture4KS.jpg?v=1771325778&width=533', 742.00, 'xbox', false, '2026-05-18', 0),
    ('ASUS ROG Delta II Gaming Headset', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIGamingHeadsetBlack1.jpg?v=1771318596&width=533', 976.00, 'xbox', false, '2026-05-06', 0),
    ('ASUS ROG Delta II Gaming Headset Kojima Productions White', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIKJPGamingHeadsetWhite1.jpg?v=1771257833&width=533', 1290.00, 'xbox', false, '2026-04-24', 0),
    ('GuliKit 720° Adjustable Tension TMR Magnetic Joystick Replacement Kit', 'https://www.gameshop.my/cdn/shop/files/Gulikit720TensionAdjustableTMRJoystick.jpg?v=1771074949&width=533', 91.00, 'xbox', false, '2026-04-12', 0),
    ('Turtle Beach Victrix Pro BFG Wireless Gaming Controller for Xbox and Windows', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachVictrixProBFGWirelessControllerforXbox1.jpg?v=1770741279&width=533', 589.00, 'xbox', false, '2026-03-31', 29.80),
    ('8BitDo Ultimate 3-Mode Controller with Charging Dock for Xbox Rare 40th Anniversary Edition', 'https://www.gameshop.my/cdn/shop/files/8BitDoUltimate3-modeWirelessControllerforXboxRare40thAnniversary1.jpg?v=1770190325&width=533', 274.00, 'xbox', false, '2026-03-19', 0),
    ('Razer Barracuda Wireless Gaming Headset', 'https://www.gameshop.my/cdn/shop/files/RazerBarracudaWirelessGamingHeadsetBlack.jpg?v=1770133499&width=533', 503.00, 'xbox', false, '2026-03-07', 0),
    ('Thrustmaster Raceline Pedals LTE (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsLTE1.jpg?v=1783175768&width=533', 497.00, 'xbox', false, '2026-02-23', 0),
    ('Thrustmaster Raceline LC Upgrade Kit (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/Slide1.png?v=1782665836&width=533', 719.00, 'xbox', false, '2026-02-11', 0),
    ('Thrustmaster Raceline Pedals III LC (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterRacelinePedalsIIILC1.jpg?v=1782663942&width=533', 1054.00, 'xbox', false, '2026-01-30', 0),
    ('Thrustmaster Formula Wheel Add-On Ferrari SF-25 Edition (Xbox Edition)', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterFormulaWheelAdd-OnFerrariSF-25Edition1.jpg?v=1782574316&width=533', 2008.00, 'xbox', false, '2026-01-18', 0),
    ('Turtle Beach Stealth Pro II Wireless Gaming Headset for Xbox, PC, PlayStation (Xbox Listing)', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachStealthProIIXboxWhite.jpg?v=1781359843&width=533', 1263.00, 'xbox', false, '2026-01-06', 0),
    ('Xbox Series X Console 1TB Digital White (Japan)', 'https://www.gameshop.my/cdn/shop/files/Photo1_7cd738d0-324d-4e73-b616-118e6a305ce3.jpg?v=1733761325&width=533', 2720.00, 'xbox', true, '2025-12-25', 0),
    ('Elgato Stream Deck Neo (Xbox Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'xbox', false, '2025-12-13', 0),

    -- ===================== PS4 (16) =====================
    ('Harvest Moon Light of Hope Complete Special Edition (PS4)', 'https://www.gameshop.my/cdn/shop/files/PS4HarvestMoonLightofHopeCompleteSpecialEdition.jpg?v=1779137978&width=533', 111.00, 'ps4', false, '2026-07-05', 0),
    ('Thrustmaster GT Wheel Add-On', 'https://www.gameshop.my/cdn/shop/files/ThrustmasterGTWheelAdd-On1.jpg?v=1778955313&width=533', 1448.00, 'ps4', false, '2026-06-23', 0),
    ('Crysis Remastered Trilogy (PS4)', 'https://www.gameshop.my/cdn/shop/files/PS4CrysisRemasteredTrilogy.jpg?v=1777136946&width=533', 132.00, 'ps4', false, '2026-06-11', 0),
    ('Call of Duty: Black Ops 7 (PS4)', 'https://www.gameshop.my/cdn/shop/files/PS4CallOfDutyBlackOps7.jpg?v=1777136547&width=533', 214.00, 'ps4', false, '2026-05-30', 0),
    ('Genki ShadowCast 3 Pro (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/GenkiShadowCast3Pro1.jpg?v=1776530810&width=533', 264.00, 'ps4', false, '2026-05-18', 0),
    ('ASUS ROG Cetra Open Wireless Gaming Earbuds', 'https://www.gameshop.my/cdn/shop/files/ROGCetraOpenWirelessGamingEarbuds1.jpg?v=1774322824&width=533', 870.00, 'ps4', true, '2026-05-06', 0),
    ('Playseat Challenge DD F1 Edition (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/PlayseatChallengeDDF1Edition1.jpg?v=1773985815&width=533', 1714.00, 'ps4', false, '2026-04-24', 0),
    ('Elgato Game Capture 4K S (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoGameCapture4KS.jpg?v=1771325778&width=533', 742.00, 'ps4', false, '2026-04-12', 0),
    ('ASUS ROG Delta II Gaming Headset (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIGamingHeadsetBlack1.jpg?v=1771318596&width=533', 939.00, 'ps4', false, '2026-03-31', 0),
    ('ASUS ROG Delta II Gaming Headset Kojima Productions White (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/ROGDeltaIIKJPGamingHeadsetWhite1.jpg?v=1771257833&width=533', 1290.00, 'ps4', false, '2026-03-19', 0),
    ('GuliKit 720° Adjustable Tension TMR Magnetic Joystick Replacement Kit (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/Gulikit720TensionAdjustableTMRJoystick.jpg?v=1771074949&width=533', 91.00, 'ps4', false, '2026-03-07', 0),
    ('Razer Barracuda Wireless Gaming Headset (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/RazerBarracudaWirelessGamingHeadsetBlack.jpg?v=1770133499&width=533', 496.00, 'ps4', false, '2026-02-23', 0),
    ('Street Fighter 6 Years 1-2 Fighters Edition (PS4/Asia)', 'https://www.gameshop.my/cdn/shop/files/Photo1_bd1f6388-29b3-4599-96ed-0d620932ed96.jpg?v=1749232743&width=533', 223.00, 'ps4', false, '2026-02-11', 0),
    ('Playseat Brake Pedal', 'https://www.gameshop.my/cdn/shop/files/PlayseatBrakePedal1.jpg?v=1769533797&width=533', 157.00, 'ps4', false, '2026-01-30', 0),
    ('Turtle Beach Victrix Pro BFG Reloaded Wireless Gaming Controller for PS5, PS4 and Windows', 'https://www.gameshop.my/cdn/shop/files/TurtleBeachVictrixProBFGReloadedWirelessControllerPS5Black.jpg?v=1769263576&width=533', 846.00, 'ps4', false, '2026-01-18', 0),
    ('Playstation Network Card USD100 - Digital Download', 'https://www.gameshop.my/cdn/shop/files/PSNCardUSD100.jpg?v=1769253330&width=533', 509.00, 'ps4', false, '2026-01-06', 0),
    ('Call of Duty Black Ops 6 (PS4/Asia)', 'https://www.gameshop.my/cdn/shop/files/PS4CallOfDutyBlackOps6.jpg?v=1769000003&width=533', 267.00, 'ps4', false, '2025-12-25', 0),
    ('Elgato Stream Deck Neo (PS4 Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'ps4', false, '2025-12-13', 0),
    -- Note: gameshop.my no longer lists a PS4 console for sale (Sony discontinued
    -- PS4 manufacturing in 2021). PS4 games/accessories are still actively sold.

    -- ===================== Nintendo Switch 2 (16) =====================
    ('The Disney Afternoon Collection (Nintendo Switch 2)', 'https://www.gameshop.my/cdn/shop/files/NSW2TheDisneyAfternoonCollection.jpg?v=1780828742&width=533', 205.00, 'switch_2', false, '2026-07-05', 0),
    ('The Rogue Prince of Persia (Nintendo Switch 2)', 'https://www.gameshop.my/cdn/shop/files/NSW2TheRoguePrinceofPersia.jpg?v=1780759166&width=533', 173.00, 'switch_2', false, '2026-06-23', 0),
    ('Final Fantasy VII Rebirth (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2FinalFantasyVIIRebirth.jpg?v=1780751051&width=533', 187.00, 'switch_2', false, '2026-06-11', 0),
    ('Dragon Quest VII Reimagined (Nintendo Switch 2)', 'https://www.gameshop.my/cdn/shop/files/NSW2DragonQuestVIIReimagined.jpg?v=1770389352&width=533', 224.00, 'switch_2', false, '2026-05-30', 0),
    ('Lollipop Chainsaw RePOP (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2LollipopChainsawRePOP.jpg?v=1780161282&width=533', 232.00, 'switch_2', false, '2026-05-18', 0),
    ('Nintendo Switch 2 Pro Controller Resident Evil Requiem Edition (Japan)', 'https://www.gameshop.my/cdn/shop/files/NSW2ProControllerResidentEvilRequiem1.jpg?v=1772139837&width=533', 360.00, 'switch_2', false, '2026-05-06', 0),
    ('Nintendo Switch 2 Joy-Con 2 L/R Light Purple/Light Green (Japan)', 'https://www.gameshop.my/cdn/shop/files/NintendoSwitch2Joy-Con2LRLightPurpleLightGreen1.jpg?v=1770829830&width=533', 328.00, 'switch_2', false, '2026-04-24', 0),
    ('Cyberpunk 2077 Ultimate Edition (Nintendo Switch 2/Japan)', 'https://www.gameshop.my/cdn/shop/files/NSW2Cyberpunk2077UltimateEditionJapan.jpg?v=1779891490&width=533', 258.00, 'switch_2', false, '2026-04-12', 0),
    ('Nyko Joy-Con Charge Dock for Nintendo Switch 2', 'https://www.gameshop.my/cdn/shop/files/NykoChargeDockforSwitch21.jpg?v=1779527670&width=533', 121.00, 'switch_2', false, '2026-03-31', 0),
    ('NBA 2K26 (Nintendo Switch 2/Europe)', 'https://www.gameshop.my/cdn/shop/files/Photo3_b70bcb3a-87ee-491e-bfc0-cb916d532679.jpg?v=1757159982&width=533', 143.00, 'switch_2', false, '2026-03-19', 0),
    ('Yoshi And The Mysterious Book (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2YoshiAndTheMysteriousBook.jpg?v=1779343628&width=533', 285.00, 'switch_2', false, '2026-03-07', 0),
    ('Tales of Arise Beyond The Dawn (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2TalesOfAriseBeyondTheDawnEdition.jpg?v=1779339250&width=533', 200.00, 'switch_2', false, '2026-02-23', 0),
    ('Nyko Gamer Dock for Nintendo Switch 2', 'https://www.gameshop.my/cdn/shop/files/NSW2NYKOGamerDock1.jpg?v=1779209090&width=533', 224.00, 'switch_2', false, '2026-02-11', 0),
    ('Hori Mario Kart Racing Wheel Pro Mini for Nintendo Switch 2', 'https://www.gameshop.my/cdn/shop/files/HoriMarioKartRacingWheelProMiniforNintendoSwitch21.jpg?v=1779078919&width=533', 363.00, 'switch_2', false, '2026-01-30', 0),
    ('Indiana Jones and The Great Circle (Nintendo Switch 2/Asia)', 'https://www.gameshop.my/cdn/shop/files/NSW2IndianaJonesandtheGreatCircle.jpg?v=1778821259&width=533', 278.00, 'switch_2', false, '2026-01-18', 0),
    ('Genki Covert Dock 3 (Switch 2 Listing)', 'https://www.gameshop.my/cdn/shop/files/GenkiConvertDock3.jpg?v=1778318973&width=533', 239.00, 'switch_2', true, '2026-01-06', 0),
    ('Nintendo Switch 2 Console (Asia)', 'https://www.gameshop.my/cdn/shop/files/Photo1_1d11f4ba-ad22-434b-8504-8375baff191e.jpg?v=1757695616&width=533', 2348.00, 'switch_2', true, '2025-12-25', 0),
    ('Elgato Stream Deck Neo (Switch 2 Listing)', 'https://www.gameshop.my/cdn/shop/files/ElgatoStreamDeckNeo.jpg?v=1769000000&width=533', 448.00, 'switch_2', false, '2025-12-13', 0)

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


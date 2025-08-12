-- Données de test pour la base de données liveShopping
-- Utilise le vendeur existant : Rebeca (id_user=23)

-- Insertion de clients (acheteurs)
INSERT INTO Users (email, username, password, contact, address, country, images, is_seller) VALUES
('client1@gmail.com', 'Andry', '$2y$13$mLZBaYDOmV/QfAgbtbwSTOoKzsKbRvJU5CHsCS5CJ.OSGuqX6GEWW', '0331234567', 'Analakely Antananarivo', 'Madagascar', NULL, false),
('client2@gmail.com', 'Miora', '$2y$13$mLZBaYDOmV/QfAgbtbwSTOoKzsKbRvJU5CHsCS5CJ.OSGuqX6GEWW', '0337654321', 'Behoririka Antananarivo', 'Madagascar', NULL, false),
('client3@gmail.com', 'Haingo', '$2y$13$mLZBaYDOmV/QfAgbtbwSTOoKzsKbRvJU5CHsCS5CJ.OSGuqX6GEWW', '0334567890', 'Isotry Antananarivo', 'Madagascar', NULL, false),
('client4@gmail.com', 'Nirina', '$2y$13$mLZBaYDOmV/QfAgbtbwSTOoKzsKbRvJU5CHsCS5CJ.OSGuqX6GEWW', '0338901234', 'Ankatso Antananarivo', 'Madagascar', NULL, false),
('client5@gmail.com', 'Fara', '$2y$13$mLZBaYDOmV/QfAgbtbwSTOoKzsKbRvJU5CHsCS5CJ.OSGuqX6GEWW', '0339876543', 'Ambohipo Antananarivo', 'Madagascar', NULL, false);

-- Catégories d'articles
INSERT INTO Category (name_category, Description) VALUES
('Vêtements Femme', 'Robes, chemisiers, pantalons et accessoires pour femmes'),
('Vêtements Homme', 'Chemises, pantalons, vestes et accessoires pour hommes'),
('Chaussures', 'Chaussures pour hommes, femmes et enfants'),
('Sacs et Maroquinerie', 'Sacs à main, portefeuilles, ceintures'),
('Bijoux et Montres', 'Bijoux fantaisie, montres, accessoires'),
('Cosmétiques', 'Produits de beauté, parfums, soins');

-- Articles du vendeur Rebeca
INSERT INTO Item (images, name_item, id_seller, id_category) VALUES
(NULL, 'Robe Malagasy Traditionnelle', 1, 1),
(NULL, 'Chemisier en Soie Blanche', 1, 1),
(NULL, 'Pantalon Jean Skinny', 1, 1),
(NULL, 'Chemise Homme Coton', 1, 2),
(NULL, 'Pantalon Chino Beige', 1, 2),
(NULL, 'Escarpins Noirs', 1, 3),
(NULL, 'Baskets Blanches Unisexe', 1, 3),
(NULL, 'Sac à Main Cuir Marron', 1, 4),
(NULL, 'Portefeuille Femme Rouge', 1, 4),
(NULL, 'Collier Perles Naturelles', 1, 5),
(NULL, 'Montre Femme Dorée', 1, 5),
(NULL, 'Rouge à Lèvres Mat', 1, 6),
(NULL, 'Parfum Floral 50ml', 1, 6);

-- Tailles disponibles
INSERT INTO Size (name_size) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL'),
('35'), ('36'), ('37'), ('38'), ('39'), ('40'), ('41'), ('42'), ('43'), ('44'),
('Unique');

-- Association articles-tailles avec valeurs spécifiques
INSERT INTO Item_size (value_size, id_size, id_item) VALUES
-- Robe Malagasy (item 1)
('XS', 1, 1), ('S', 2, 1), ('M', 3, 1), ('L', 4, 1),
-- Chemisier (item 2) 
('S', 2, 2), ('M', 3, 2), ('L', 4, 2), ('XL', 5, 2),
-- Pantalon Jean (item 3)
('S', 2, 3), ('M', 3, 3), ('L', 4, 3),
-- Chemise Homme (item 4)
('M', 3, 4), ('L', 4, 4), ('XL', 5, 4), ('XXL', 6, 4),
-- Pantalon Chino (item 5)
('M', 3, 5), ('L', 4, 5), ('XL', 5, 5),
-- Escarpins (item 6)
('36', 8, 6), ('37', 9, 6), ('38', 10, 6), ('39', 11, 6), ('40', 12, 6),
-- Baskets (item 7)
('37', 9, 7), ('38', 10, 7), ('39', 11, 7), ('40', 12, 7), ('41', 13, 7), ('42', 14, 7),
-- Sac à main, Portefeuille, Collier, Montre, Rouge à lèvres, Parfum (taille unique)
('Unique', 17, 8), ('Unique', 17, 9), ('Unique', 17, 10), ('Unique', 17, 11), ('Unique', 17, 12), ('Unique', 17, 13);

-- Stock des articles (entrées et sorties)
INSERT INTO Items_stock (out_item, in_item, date_move, id_item_size) VALUES
-- Entrées de stock initiales
(NULL, '50', '2024-12-01 08:00:00', 1),
(NULL, '30', '2024-12-01 08:00:00', 2),
(NULL, '25', '2024-12-01 08:00:00', 5),
(NULL, '40', '2024-12-01 08:00:00', 10),
(NULL, '15', '2024-12-01 08:00:00', 20),
-- Sorties (ventes)
(5, NULL, '2024-12-15 14:30:00', 1),
(3, NULL, '2024-12-20 10:15:00', 2),
(2, NULL, '2025-01-05 16:45:00', 5),
-- Réapprovisionnements
(NULL, '20', '2025-01-10 09:00:00', 1),
(NULL, '15', '2025-01-10 09:00:00', 2);

-- Prix des articles
INSERT INTO Price_items (price, date_price, id_item) VALUES
-- Prix actuels
(85000.00, '2025-12-01', 1), -- Robe Malagasy
(45000.00, '2025-12-01', 2), -- Chemisier
(35000.00, '2025-12-01', 3), -- Pantalon Jean
(28000.00, '2025-12-01', 4), -- Chemise Homme
(40000.00, '2025-12-01', 5), -- Pantalon Chino
(65000.00, '2025-12-01', 6), -- Escarpins
(55000.00, '2025-12-01', 7), -- Baskets
(120000.00, '2025-12-01', 8), -- Sac à main
(25000.00, '2025-12-01', 9), -- Portefeuille
(18000.00, '2025-12-01', 10), -- Collier
(75000.00, '2025-12-01', 11), -- Montre
(12000.00, '2025-12-01', 12), -- Rouge à lèvres
(95000.00, '2025-12-01', 13), -- Parfum
-- Anciens prix (pour historique)
(80000.00, '2025-01-01', 1),
(42000.00, '2025-01-01', 2),
(32000.00, '2025-01-01', 3);

-- Promotions
INSERT INTO Promotion (name_promotion, description, percentage, start_date, end_date, id_item) VALUES
('Promo Fin d Année', 'Réduction spéciale pour les fêtes', 15.00, '2024-12-20', '2025-01-05', 1),
('Soldes Hiver', 'Déstockage vêtements hiver', 25.00, '2025-01-15', '2025-02-15', 2),
('Saint-Valentin', 'Offre spéciale bijoux', 20.00, '2025-02-10', '2025-02-16', 10),
('Liquidation Chaussures', 'Fin de collection', 30.00, '2025-01-20', '2025-01-31', 6);

-- Types de notifications
INSERT INTO Notification_type (name_type) VALUES
('Nouvelle commande'),
('Promotion'),
('Stock faible'),
('Live en cours'),
('Commande expédiée'),
('Nouveau follower');

-- Favoris des clients
INSERT INTO Favorites (create_at, id_client) VALUES
('2024-12-10 15:30:00', 2), -- Andry
('2024-12-12 09:15:00', 3), -- Miora
('2024-12-15 20:45:00', 4), -- Haingo
('2025-01-02 11:20:00', 5), -- Nirina
('2025-01-08 16:30:00', 6); -- Fara

-- Détails des favoris
INSERT INTO Favorite_details (id_item_size, id_favorites) VALUES
(1, 1), (10, 1), (20, 1), -- Articles favoris d'Andry
(2, 2), (5, 2), -- Articles favoris de Miora
(1, 3), (25, 3), (30, 3), -- Articles favoris d'Haingo
(10, 4), (15, 4), -- Articles favoris de Nirina
(20, 5), (25, 5), (35, 5); -- Articles favoris de Fara

-- Paniers
INSERT INTO Bag (create_at, is_commande, id_client, id_seller) VALUES
('2024-12-15 14:20:00', true, 2, 1), -- Commande d'Andry
('2024-12-20 10:10:00', true, 3, 1), -- Commande de Miora
('2025-01-05 16:40:00', true, 4, 1), -- Commande d'Haingo
('2025-01-15 11:30:00', false, 5, 1), -- Panier actuel de Nirina
('2025-01-20 14:15:00', false, 6, 1); -- Panier actuel de Fara

-- Détails des paniers
INSERT INTO Bag_details (id_item_size, id_bag) VALUES
-- Commande d'Andry (bag 1)
(1, 1), (25, 1),
-- Commande de Miora (bag 2)
(2, 2), (5, 2),
-- Commande d'Haingo (bag 3)
(5, 3), (20, 3),
-- Panier de Nirina (bag 4)
(10, 4), (30, 4),
-- Panier de Fara (bag 5)
(15, 5), (35, 5);

-- Followers du vendeur
INSERT INTO Follow_seller (date_following, id_client, id_seller) VALUES
('2024-12-05 10:30:00', 2, 1), -- Andry suit Rebeca
('2024-12-08 14:45:00', 3, 1), -- Miora suit Rebeca
('2024-12-12 09:20:00', 4, 1), -- Haingo suit Rebeca
('2024-12-18 16:15:00', 5, 1), -- Nirina suit Rebeca
('2025-01-03 11:50:00', 6, 1); -- Fara suit Rebeca

-- Lives du vendeur
INSERT INTO Live (start_live, end_live, nbr_like, id_seller) VALUES
('2024-12-15 19:00:00', '2024-12-15 20:30:00', 45, 1),
('2024-12-22 18:00:00', '2024-12-22 19:15:00', 32, 1),
('2025-01-05 20:00:00', '2025-01-05 21:45:00', 67, 1),
('2025-01-15 19:30:00', NULL, 23, 1), -- Live en cours
('2025-01-20 18:00:00', '2025-01-20 19:00:00', 41, 1);

-- Articles présentés en live
INSERT INTO Live_details (id_item, id_live) VALUES
(1, 1), (2, 1), (6, 1), -- Premier live
(3, 2), (4, 2), (7, 2), -- Deuxième live
(8, 3), (9, 3), (10, 3), (11, 3), -- Troisième live
(12, 4), (13, 4), (1, 4), -- Live en cours
(2, 5), (5, 5), (6, 5); -- Dernier live

-- États des commandes
INSERT INTO State_commande (name_state) VALUES
('En attente'),
('Confirmée'),
('En préparation'),
('Expédiée'),
('Livrée'),
('Annulée');

-- Commandes
INSERT INTO Commande (id_state, id_bag) VALUES
(5, 1), -- Commande d'Andry livrée
(4, 2), -- Commande de Miora expédiée
(3, 3); -- Commande d'Haingo en préparation

-- Notifications
INSERT INTO Notification (title, content, is_read, date_creation, id_type, id_user) VALUES
-- Notifications pour le vendeur Rebeca
('Nouvelle commande reçue', 'Andry a passé une commande', true, '2024-12-15 14:25:00', 1, 1),
('Stock faible', 'Le stock de la Robe Malagasy est faible', false, '2025-01-18 08:00:00', 3, 1),
('Nouveau follower', 'Fara vous suit maintenant', false, '2025-01-03 11:55:00', 6, 1),
-- Notifications pour les clients
('Commande expédiée', 'Votre commande a été expédiée', true, '2024-12-21 10:00:00', 5, 3),
('Live en cours', 'Rebeca est en live maintenant!', false, '2025-01-15 19:35:00', 4, 2),
('Promotion active', 'Profitez de 15% de réduction sur la Robe Malagasy', false, '2024-12-20 09:00:00', 2, 4);

-- Liaison des notifications
INSERT INTO Liaison_notification (name_table, id_table, id_notification) VALUES
('Commande', 1, 1),
('Item', 1, 2),
('Follow_seller', 5, 3),
('Commande', 2, 4),
('Live', 4, 5),
('Promotion', 1, 6);

-- Ventes
INSERT INTO Sale (sale_date, is_paid, id_commande) VALUES
('2024-12-16 09:30:00', true, 1), -- Vente d'Andry payée
('2024-12-21 14:20:00', true, 2), -- Vente de Miora payée
('2025-01-06 11:15:00', false, 3); -- Vente d'Haingo en attente de paiement

INSERT INTO Sale (sale_date, is_paid, id_commande) VALUES
('2025-12-16 09:30:00', true, 1), -- Vente d'Andry payée
('2024-12-21 14:20:00', true, 2), -- Vente de Miora payée
('2025-01-06 11:15:00', false, 3); -- Vente d'Haingo en attente de paiement



INSERT INTO Sale (sale_date, is_paid, id_commande) VALUES
('2025-02-16 09:30:00', true, 1), -- Vente d'Andry payée
('2025-12-21 14:20:00', true, 2), -- Vente de Miora payée
('2025-01-06 11:15:00', true, 3); -- Vente d'Haingo en attente de paiement

UPDATE item
SET images = 'robe.jpg'
WHERE id_item = 1;

UPDATE item
SET images = 'chemise.jpg'
WHERE id_item = 2;

UPDATE item
SET images = 'jean.jpg'
WHERE id_item = 3;

UPDATE item
SET images = 'chemisecoton.jpg'
WHERE id_item = 4;

UPDATE item
SET images = 'ChinoBeige.jpg'
WHERE id_item = 5;

UPDATE item
SET images = 'EscarpinsNoirs.jpg'
WHERE id_item = 6;

UPDATE item
SET images = 'BasketsUnisexe.jpg'
WHERE id_item = 7;

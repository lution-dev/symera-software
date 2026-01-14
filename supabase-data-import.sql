--
-- PostgreSQL database dump
--

\restrict YeTzTVqMZQDtO8HrBeLzPgA8dhVOxIKLd4Eo0PIVph2pPxKpSctKnPhJONYzSlh

-- Dumped from database version 16.11 (f45eb12)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('user1', 'joao.silva@exemplo.com', 'João', 'Silva', 'https://ui-avatars.com/api/?name=João+Silva', '2025-05-15 04:44:21.938516', '2025-05-15 04:44:21.938516', '11999999999');
INSERT INTO public.users VALUES ('user2', 'maria.santos@exemplo.com', 'Maria', 'Santos', 'https://ui-avatars.com/api/?name=Maria+Santos', '2025-05-15 04:44:21.938516', '2025-05-15 04:44:21.938516', '11999999999');
INSERT INTO public.users VALUES ('user3', 'carlos.oliveira@exemplo.com', 'Carlos', 'Oliveira', 'https://ui-avatars.com/api/?name=Carlos+Oliveira', '2025-05-15 04:44:21.938516', '2025-05-15 04:44:21.938516', '11999999999');
INSERT INTO public.users VALUES ('user4', 'ana.pereira@exemplo.com', 'Ana', 'Pereira', 'https://ui-avatars.com/api/?name=Ana+Pereira', '2025-05-15 04:44:21.938516', '2025-05-15 04:44:21.938516', '11999999999');
INSERT INTO public.users VALUES ('123456789', 'teste@exemplo.com', 'Usuário', 'Teste', 'https://i.pravatar.cc/300', '2025-05-18 06:02:21.825578', '2025-05-18 06:02:21.825578', NULL);
INSERT INTO public.users VALUES ('999001', 'joao@exemplo.com', 'João', 'Silva', 'https://ui-avatars.com/api/?name=João+Silva&background=random', '2025-05-22 19:46:06.593', '2025-05-22 19:46:06.593', '+55 11 91234-5678');
INSERT INTO public.users VALUES ('999002', 'maria@exemplo.com', 'Maria', 'Santos', 'https://ui-avatars.com/api/?name=Maria+Santos&background=random', '2025-05-22 19:46:06.743', '2025-05-22 19:46:06.743', '+55 11 98765-4321');
INSERT INTO public.users VALUES ('999003', 'carlos@exemplo.com', 'Carlos', 'Oliveira', 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=random', '2025-05-22 19:46:06.92', '2025-05-22 19:46:06.92', '+55 11 97777-8888');
INSERT INTO public.users VALUES ('local-1748630810479', 'test@exemplo.com', 'test', NULL, NULL, '2025-05-30 18:46:50.479', '2025-05-30 18:46:50.479', NULL);
INSERT INTO public.users VALUES ('local-1757942163584-axnbi0eqs', 'marketing@globalthings.net', 'Asdrubal', 'Neto', NULL, '2025-09-15 13:16:03.584', '2025-09-15 13:16:03.584', '(11) 91737-3372');
INSERT INTO public.users VALUES ('47537065', 'mktglobalthings@gmail.com', NULL, NULL, NULL, '2025-09-13 00:48:52.906014', '2025-09-16 14:55:15.733', NULL);
INSERT INTO public.users VALUES ('local-1749855804892-kj0tmwymd', 'jholsantana@hotmail.com', 'Jonatas', 'Santana', NULL, '2025-06-13 23:03:24.892', '2025-06-13 23:03:24.892', '11981791022');
INSERT INTO public.users VALUES ('8650891', 'applution@gmail.com', 'Lucas Pires', '@ Lution', 'https://storage.googleapis.com/replit/images/1745976054259_80bddf1c737225f5a76b693617927c0d.png', '2025-05-15 04:47:25.23', '2026-01-14 20:07:22.101', '+55 (11) 99999-9999');
INSERT INTO public.users VALUES ('43823386', 'gilero7244@calorpg.com', 'teste', NULL, NULL, '2025-06-13 23:14:03.910429', '2025-06-13 23:21:36.504', NULL);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.events VALUES (12, 'Domine o Palco com Flávia Lima', 'workshop', 'Santo Rolê', 'Workshop intensivo de 3 dias focado em dança e performance. Aprenda na prática com os melhores profissionais e destaque-se no palco.', 4000, -108153, 100, 'planning', '8650891', '2025-06-05 21:30:58.117449', '2025-08-05 15:23:33.032', '/uploads/events/event-12-1749159058162.jpeg', '2025-08-03 00:00:00', '2025-08-03 00:00:00', '13:30', '17:00', 'in_person', '', '2f3693b4-a932-4800-b1ca-77ef0f8d04c5-00-1qqsfoel3ix03.kirk.replit.dev/feedback/feedback_12_1754319038647_53ffxtp3x');
INSERT INTO public.events VALUES (7, 'Conferência Anual de Tecnologia', 'conference', 'Rio de Janeiro, RJ', 'Evento corporativo para 300 pessoas', 100000, 30000, 300, 'planning', '8650891', '2025-05-15 05:36:59.47999', '2025-05-15 05:36:59.47999', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop', '2025-09-10 00:00:00', '2025-09-10 00:00:00', '19:00', '23:00', 'in_person', NULL, NULL);
INSERT INTO public.events VALUES (9, 'Workshop de Marketing Digital', 'corporate', 'Porto Alegre, RS', 'Workshop para 50 profissionais de marketing', 8000, 3000, 50, 'planning', '8650891', '2025-05-15 05:36:59.47999', '2025-05-23 03:46:12.892', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop', '2025-07-05 00:00:00', '2025-07-05 00:00:00', '19:00', '23:00', 'online', 'https://meet.google.com/vzx-yqvs-mvw', NULL);
INSERT INTO public.events VALUES (11, 'Festa de 30 Anos da Mariana', 'social', 'Buffet Jardim Verde, Campinas', 'Festa temática com DJ, pista de dança, decoração personalizada e bar de drinks. Será à noite com jantar completo e atrações surpresa.', 18000, 0, 80, 'planning', '8650891', '2025-05-22 23:24:21.389913', '2025-05-22 23:24:21.389913', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', '2025-05-31 00:00:00', '2025-06-01 00:00:00', '19:00', '02:00', 'in_person', NULL, NULL);
INSERT INTO public.events VALUES (8, 'Jantar Beneficente', 'social', 'Brasília, DF', 'Evento beneficente para arrecadar fundos', 15000, 2000, 50, 'planning', '8650891', '2025-05-15 05:36:59.47999', '2025-05-15 05:36:59.47999', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', '2025-11-25 00:00:00', '2025-11-25 00:00:00', '19:00', '23:00', 'in_person', NULL, NULL);
INSERT INTO public.events VALUES (10, 'Lançamento Coleção Primavera 2025', 'corporate', 'Hotel Unique, São Paulo', 'Evento de lançamento da nova coleção primavera de uma marca de moda. Coquetel com convidados VIPs, apresentação no auditório e showroom ao vivo com modelos.', 35000, 0, 150, 'completed', '8650891', '2025-05-17 15:32:21.459265', '2025-05-17 15:32:21.459265', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop', '2025-05-17 00:00:00', '2025-05-17 00:00:00', '09:00', '18:00', 'in_person', NULL, NULL);
INSERT INTO public.events VALUES (6, 'Aniversário de 15 anos', 'birthday', 'São Paulo, SP', 'Festa de 15 anos para 80 convidados', 25000, 5000, 80, 'completed', '8650891', '2025-05-15 05:36:59.47999', '2025-05-15 05:36:59.47999', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', '2025-04-20 00:00:00', '2025-04-20 00:00:00', '19:00', '23:00', 'in_person', NULL, 'ab6e0058-4c7e-497b-add9-6b3d72575cad-00-3g3syi9tzv2nh.kirk.replit.dev/feedback/feedback_6_1749139594274_eyce0i35b');
INSERT INTO public.events VALUES (5, 'Casamento João e Maria', 'wedding', 'Recife, PE', 'Cerimônia e recepção para 150 convidados', 50000, 15000, 150, 'confirmed', '8650891', '2025-05-15 05:36:59.47999', '2025-06-05 21:26:48.096', '/uploads/events/event-5-1749158808094.jpeg', '2025-06-15 00:00:00', '2025-06-15 00:00:00', '19:00', '23:00', 'in_person', '', NULL);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.activity_logs VALUES (53, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:32:10.170662');
INSERT INTO public.activity_logs VALUES (54, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:36:46.245291');
INSERT INTO public.activity_logs VALUES (55, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:46:13.000083');
INSERT INTO public.activity_logs VALUES (56, 10, '8650891', 'updated_task', '{"taskTitle": "Enviar agradecimentos aos convidados"}', '2025-05-23 22:18:01.722839');
INSERT INTO public.activity_logs VALUES (57, 5, '8650891', 'expense_updated', '{"paid": true, "amount": 8000, "itemName": "Buffet - parcela 2"}', '2025-05-25 19:56:50.186682');
INSERT INTO public.activity_logs VALUES (58, 5, '8650891', 'expense_updated', '{"paid": false, "amount": 8000, "itemName": "Buffet - parcela 2"}', '2025-05-25 19:56:53.309244');
INSERT INTO public.activity_logs VALUES (59, 5, '8650891', 'document_added', '{"category": "imagens", "filename": "Flyer Feed"}', '2025-05-26 18:19:34.738749');
INSERT INTO public.activity_logs VALUES (60, 5, '8650891', 'delete', '{}', '2025-05-27 01:44:19.444192');
INSERT INTO public.activity_logs VALUES (61, 5, '8650891', 'document_added', '{"category": "outros", "filename": "Documento sem nome"}', '2025-05-27 01:45:01.721503');
INSERT INTO public.activity_logs VALUES (62, 5, '8650891', 'delete', '{}', '2025-05-27 01:57:00.469909');
INSERT INTO public.activity_logs VALUES (17, 5, '8650891', 'vendor_added', '{"service": "catering", "vendorName": "Buffet Elegância"}', '2025-05-16 21:22:13.370258');
INSERT INTO public.activity_logs VALUES (18, 5, '8650891', 'vendor_added', '{"service": "decoration", "vendorName": "Flores do Jardim"}', '2025-05-16 21:22:13.441562');
INSERT INTO public.activity_logs VALUES (19, 5, '8650891', 'vendor_added', '{"service": "costume", "vendorName": "Ateliê de Noivas"}', '2025-05-16 21:22:13.508632');
INSERT INTO public.activity_logs VALUES (20, 5, '8650891', 'vendor_added', '{"service": "music", "vendorName": "DJ Marcos"}', '2025-05-16 21:22:13.578689');
INSERT INTO public.activity_logs VALUES (21, 5, '8650891', 'vendor_added', '{"service": "photography", "vendorName": "Fotografias Eternas"}', '2025-05-16 21:22:13.644882');
INSERT INTO public.activity_logs VALUES (22, 6, '8650891', 'vendor_added', '{"service": "catering", "vendorName": "Festas & Cia"}', '2025-05-16 21:22:13.712172');
INSERT INTO public.activity_logs VALUES (23, 6, '8650891', 'vendor_added', '{"service": "decoration", "vendorName": "Balões Mágicos"}', '2025-05-16 21:22:13.779329');
INSERT INTO public.activity_logs VALUES (24, 6, '8650891', 'vendor_added', '{"service": "music", "vendorName": "DJ Teen"}', '2025-05-16 21:22:13.846904');
INSERT INTO public.activity_logs VALUES (25, 6, '8650891', 'vendor_added', '{"service": "cake", "vendorName": "Doces Sonhos Confeitaria"}', '2025-05-16 21:22:13.913722');
INSERT INTO public.activity_logs VALUES (26, 7, '8650891', 'vendor_added', '{"service": "venue", "vendorName": "Centro de Convenções Nacional"}', '2025-05-16 21:22:13.979983');
INSERT INTO public.activity_logs VALUES (27, 7, '8650891', 'vendor_added', '{"service": "music", "vendorName": "Tech Sound & Vision"}', '2025-05-16 21:22:14.047266');
INSERT INTO public.activity_logs VALUES (28, 7, '8650891', 'vendor_added', '{"service": "catering", "vendorName": "Coffee Break Express"}', '2025-05-16 21:22:14.11301');
INSERT INTO public.activity_logs VALUES (29, 7, '8650891', 'vendor_added', '{"service": "invitation", "vendorName": "Crachás & Materiais"}', '2025-05-16 21:22:14.179812');
INSERT INTO public.activity_logs VALUES (30, 7, '8650891', 'vendor_added', '{"service": "photography", "vendorName": "Streaming Pro"}', '2025-05-16 21:22:14.247162');
INSERT INTO public.activity_logs VALUES (31, 9, '8650891', 'vendor_added', '{"service": "venue", "vendorName": "Espaço Coworking Central"}', '2025-05-16 21:22:14.313894');
INSERT INTO public.activity_logs VALUES (32, 9, '8650891', 'vendor_added', '{"service": "catering", "vendorName": "Café & Cia"}', '2025-05-16 21:22:14.38055');
INSERT INTO public.activity_logs VALUES (33, 9, '8650891', 'vendor_added', '{"service": "invitation", "vendorName": "Gráfica Express"}', '2025-05-16 21:22:14.448231');
INSERT INTO public.activity_logs VALUES (34, 8, '8650891', 'vendor_added', '{"service": "venue", "vendorName": "Restaurante Le Bistro"}', '2025-05-16 21:22:14.514831');
INSERT INTO public.activity_logs VALUES (35, 8, '8650891', 'vendor_added', '{"service": "music", "vendorName": "Trio de Cordas Clássico"}', '2025-05-16 21:22:14.581597');
INSERT INTO public.activity_logs VALUES (36, 8, '8650891', 'vendor_added', '{"service": "other", "vendorName": "Leilão Solidário"}', '2025-05-16 21:22:14.648268');
INSERT INTO public.activity_logs VALUES (37, 8, '8650891', 'vendor_added', '{"service": "invitation", "vendorName": "Convites Elegantes"}', '2025-05-16 21:22:14.715237');
INSERT INTO public.activity_logs VALUES (38, 10, '8650891', 'created_event', '{"eventName": "Lançamento Coleção Primavera 2025"}', '2025-05-17 15:32:21.735414');
INSERT INTO public.activity_logs VALUES (39, 10, '8650891', 'added_team_member', '{"role": "organizer", "addedBy": "system"}', '2025-05-17 15:38:32.388194');
INSERT INTO public.activity_logs VALUES (40, 10, '8650891', 'generated_ai_checklist', '{"taskCount": 3}', '2025-05-20 19:35:28.691989');
INSERT INTO public.activity_logs VALUES (41, 10, '8650891', 'generated_ai_checklist', '{"taskCount": 25}', '2025-05-21 18:56:57.455476');
INSERT INTO public.activity_logs VALUES (42, 8, '8650891', 'generated_ai_checklist', '{"taskCount": 8}', '2025-05-21 19:13:19.597953');
INSERT INTO public.activity_logs VALUES (43, 11, '8650891', 'created_event', '{"eventName": "Festa de 30 Anos da Mariana"}', '2025-05-22 23:24:22.238836');
INSERT INTO public.activity_logs VALUES (44, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:05:18.335696');
INSERT INTO public.activity_logs VALUES (45, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:07:47.800243');
INSERT INTO public.activity_logs VALUES (46, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:10:16.469797');
INSERT INTO public.activity_logs VALUES (47, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:13:34.683092');
INSERT INTO public.activity_logs VALUES (48, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:15:44.29477');
INSERT INTO public.activity_logs VALUES (49, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:18:29.355087');
INSERT INTO public.activity_logs VALUES (50, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:26:24.048824');
INSERT INTO public.activity_logs VALUES (51, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:26:42.249273');
INSERT INTO public.activity_logs VALUES (52, 9, '8650891', 'updated_event', '{"eventName": "Workshop de Marketing Digital"}', '2025-05-23 03:30:05.229038');
INSERT INTO public.activity_logs VALUES (63, 5, '8650891', 'document_added', '{"category": "outros", "filename": "Documento sem nome"}', '2025-05-27 01:57:47.947737');
INSERT INTO public.activity_logs VALUES (64, 5, '8650891', 'delete', '{}', '2025-05-27 02:02:36.102175');
INSERT INTO public.activity_logs VALUES (65, 5, '8650891', 'document_added', '{"category": "outros", "filename": "Documento sem nome"}', '2025-05-27 02:06:02.149797');
INSERT INTO public.activity_logs VALUES (66, 5, '8650891', 'document_added', '{"category": "outros", "filename": "documento-1748312151725"}', '2025-05-27 02:15:51.842499');
INSERT INTO public.activity_logs VALUES (67, 5, '8650891', 'delete', '{}', '2025-05-27 02:24:14.39219');
INSERT INTO public.activity_logs VALUES (68, 5, '8650891', 'delete', '{}', '2025-05-27 02:31:16.493613');
INSERT INTO public.activity_logs VALUES (69, 5, '8650891', 'document_added', '{"category": "outros", "filename": "documento-1748313133412"}', '2025-05-27 02:32:13.521797');
INSERT INTO public.activity_logs VALUES (70, 5, '8650891', 'delete', '{}', '2025-05-27 02:40:27.955369');
INSERT INTO public.activity_logs VALUES (71, 5, '8650891', 'document_added', '{"category": "outros", "filename": "documento-1748313659174"}', '2025-05-27 02:40:59.279536');
INSERT INTO public.activity_logs VALUES (72, 5, '8650891', 'delete', '{}', '2025-05-27 02:41:21.058793');
INSERT INTO public.activity_logs VALUES (73, 5, '8650891', 'document_added', '{"category": "outros", "filename": "documento-1748313715374"}', '2025-05-27 02:41:55.48892');
INSERT INTO public.activity_logs VALUES (74, 5, '8650891', 'delete', '{}', '2025-05-27 02:43:53.109221');
INSERT INTO public.activity_logs VALUES (75, 5, '8650891', 'document_added', '{"category": "outros", "filename": "documento-1748313884585"}', '2025-05-27 02:44:44.695013');
INSERT INTO public.activity_logs VALUES (76, 5, '8650891', 'delete', '{}', '2025-05-28 15:20:25.284287');
INSERT INTO public.activity_logs VALUES (77, 5, '8650891', 'document_added', '{"category": "Imagem", "filename": "Teste Feed"}', '2025-05-28 15:21:17.374219');
INSERT INTO public.activity_logs VALUES (78, 5, '8650891', 'import_participants', '{"count": 10, "origin": "csv"}', '2025-05-29 00:07:31.338789');
INSERT INTO public.activity_logs VALUES (79, 5, '8650891', 'create_participant', '{"participantName": "João Teste"}', '2025-05-29 01:09:34.77044');
INSERT INTO public.activity_logs VALUES (80, 5, '8650891', 'removed_team_member', '{"removedUserId": "38"}', '2025-05-29 15:13:56.390027');
INSERT INTO public.activity_logs VALUES (81, 5, '8650891', 'removed_team_member', '{"removedUserId": "38"}', '2025-05-29 15:15:33.298847');
INSERT INTO public.activity_logs VALUES (82, 5, '8650891', 'removed_team_member', '{"removedUserId": "38"}', '2025-05-29 15:18:27.059801');
INSERT INTO public.activity_logs VALUES (83, 5, '8650891', 'removed_team_member', '{"removedUserId": "38"}', '2025-05-29 15:22:29.678688');
INSERT INTO public.activity_logs VALUES (84, 5, '8650891', 'removed_team_member', '{"removedUserId": "37"}', '2025-05-29 15:25:13.519148');
INSERT INTO public.activity_logs VALUES (85, 5, '8650891', 'removed_team_member', '{"removedUserId": "37"}', '2025-05-29 15:30:01.090395');
INSERT INTO public.activity_logs VALUES (86, 5, '8650891', 'updated_event', '{"eventName": "Casamento João e Maria"}', '2025-06-05 21:19:40.663164');
INSERT INTO public.activity_logs VALUES (87, 5, '8650891', 'updated_event', '{"eventName": "Casamento João e Maria"}', '2025-06-05 21:20:59.916176');
INSERT INTO public.activity_logs VALUES (88, 5, '8650891', 'updated_event', '{"eventName": "Casamento João e Maria"}', '2025-06-05 21:26:48.211915');
INSERT INTO public.activity_logs VALUES (89, 12, '8650891', 'created_event', '{"eventName": "Domine o Palco com Flávia Lima"}', '2025-06-05 21:30:58.4005');
INSERT INTO public.activity_logs VALUES (90, 12, '8650891', 'updated_event', '{"eventName": "Domine o Palco com Flávia Lima"}', '2025-06-05 21:53:29.980026');
INSERT INTO public.activity_logs VALUES (91, 12, '8650891', 'expense_added', '{"amount": -42352, "category": "accommodation_travel", "itemName": "teste", "vendorId": null}', '2025-06-06 17:46:52.302548');
INSERT INTO public.activity_logs VALUES (92, 12, '8650891', 'expense_updated', '{"paid": true, "amount": -50000, "itemName": "Artes do Evento - Giulio"}', '2025-06-06 18:29:17.795375');
INSERT INTO public.activity_logs VALUES (93, 12, '8650891', 'expense_updated', '{"paid": true, "amount": -50000, "itemName": "Artes do Evento - Giulio"}', '2025-06-11 16:38:21.742899');
INSERT INTO public.activity_logs VALUES (94, 12, '8650891', 'expense_added', '{"amount": -3810, "category": "graphic_materials", "itemName": "Impressão das artes A4 para divulgação", "vendorId": null}', '2025-06-13 22:02:22.908455');
INSERT INTO public.activity_logs VALUES (95, 12, '8650891', 'expense_added', '{"amount": -240, "category": "other", "itemName": "Flávia Lima", "vendorId": null}', '2025-06-13 22:12:43.862598');
INSERT INTO public.activity_logs VALUES (96, 12, '8650891', 'expense_updated', '{"paid": false, "amount": -240, "itemName": "Flávia Lima"}', '2025-06-13 22:12:57.646659');
INSERT INTO public.activity_logs VALUES (97, 12, '8650891', 'expense_updated', '{"paid": false, "amount": -240000, "itemName": "Flávia Lima"}', '2025-06-13 22:40:43.012166');
INSERT INTO public.activity_logs VALUES (98, 12, '8650891', 'added_team_member', '{"memberRole": "organizer", "memberEmail": "jholsantana@hotmail.com"}', '2025-06-13 23:03:25.147271');
INSERT INTO public.activity_logs VALUES (99, 12, '8650891', 'added_team_member', '{"memberRole": "team_member", "memberEmail": "gilero7244@calorpg.com"}', '2025-06-13 23:15:06.959422');
INSERT INTO public.activity_logs VALUES (100, 12, '43823386', 'removed_team_member', '{"removedUserId": "41"}', '2025-06-13 23:34:53.427752');
INSERT INTO public.activity_logs VALUES (101, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "Faltam 10 dias"}', '2025-06-16 20:42:01.642786');
INSERT INTO public.activity_logs VALUES (102, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "Faltam 8 dias"}', '2025-06-16 20:42:26.90407');
INSERT INTO public.activity_logs VALUES (103, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "Faltam 6 dias"}', '2025-06-16 20:42:57.897163');
INSERT INTO public.activity_logs VALUES (104, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "Faltam 4 dias"}', '2025-06-16 20:43:20.736289');
INSERT INTO public.activity_logs VALUES (105, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "Faltam 2 dias"}', '2025-06-16 20:43:49.392168');
INSERT INTO public.activity_logs VALUES (106, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "É amanha"}', '2025-06-16 20:44:12.595453');
INSERT INTO public.activity_logs VALUES (107, 12, '8650891', 'document_added', '{"category": "Imagem", "filename": "É hoje!"}', '2025-06-16 20:44:35.56248');
INSERT INTO public.activity_logs VALUES (108, 12, '8650891', 'expense_added', '{"amount": -10421, "category": "marketing", "itemName": "Impulsionamento Carrossel Feed", "vendorId": null}', '2025-06-16 21:36:25.46746');
INSERT INTO public.activity_logs VALUES (109, 12, '8650891', 'expense_updated', '{"paid": true, "amount": -10421, "itemName": "Impulsionamento Vídeo Feed"}', '2025-06-16 21:36:54.391753');
INSERT INTO public.activity_logs VALUES (110, 12, '8650891', 'expense_added', '{"amount": -10172, "category": "marketing", "itemName": "Impulsionamento Carrossel Feed", "vendorId": null}', '2025-06-16 21:37:43.64837');
INSERT INTO public.activity_logs VALUES (111, 12, '8650891', 'schedule_item_created', '{"title": "Boas-vindas e apresentação dos professores e alunos", "startTime": "18:00"}', '2025-06-17 18:58:31.47937');
INSERT INTO public.activity_logs VALUES (112, 12, '8650891', 'expense_added', '{"amount": 50000, "category": "sponsor", "itemName": "Patrocínio Buenas Carnes", "vendorId": null}', '2025-06-17 22:28:50.031712');
INSERT INTO public.activity_logs VALUES (113, 12, '8650891', 'schedule_item_created', '{"title": "Teste", "startTime": "10:00"}', '2025-06-20 19:34:37.072873');
INSERT INTO public.activity_logs VALUES (114, 12, '8650891', 'schedule_item_created', '{"title": "Recepção", "startTime": "18:00"}', '2025-06-20 20:17:30.840043');
INSERT INTO public.activity_logs VALUES (115, 12, '8650891', 'schedule_item_deleted', '{"title": "Teste", "startTime": "10:00"}', '2025-06-20 20:17:38.620908');
INSERT INTO public.activity_logs VALUES (116, 12, '8650891', 'schedule_item_deleted', '{"title": "Boas-vindas e apresentação dos professores e alunos", "startTime": "18:00"}', '2025-06-20 20:17:42.572562');
INSERT INTO public.activity_logs VALUES (117, 12, '8650891', 'schedule_item_created', '{"title": "Recepção dia 2", "startTime": "10:00"}', '2025-06-20 20:18:57.638377');
INSERT INTO public.activity_logs VALUES (118, 12, '8650891', 'schedule_item_created', '{"title": "Inicio Workshop", "startTime": "18:30"}', '2025-06-21 17:10:23.775463');
INSERT INTO public.activity_logs VALUES (119, 12, '8650891', 'removed_team_member', '{"removedUserId": "42"}', '2025-06-21 17:15:38.147633');
INSERT INTO public.activity_logs VALUES (120, 12, '8650891', 'updated_event', '{"eventName": "Domine o Palco com Flávia Lima"}', '2025-06-25 18:19:22.333605');
INSERT INTO public.activity_logs VALUES (121, 12, '8650891', 'expense_updated', '{"paid": false, "amount": -80000, "itemName": "Flávia Lima"}', '2025-07-14 20:35:37.231341');
INSERT INTO public.activity_logs VALUES (122, 12, '8650891', 'expense_added', '{"amount": -3750, "category": "graphic_materials", "itemName": "Impressão das artes A4 para divulgação", "vendorId": null}', '2025-07-14 20:36:25.149791');
INSERT INTO public.activity_logs VALUES (123, 12, '8650891', 'expense_updated', '{"paid": true, "amount": -80000, "itemName": "Flávia Lima"}', '2025-08-05 15:23:33.139193');


--
-- Data for Name: budget_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.budget_items VALUES (1, 5, 'Reserva igreja', 'venue', 2000, true, '2025-01-10 00:00:00', 'Reserva para cerimônia religiosa', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (2, 5, 'Flores para cerimônia', 'decoration', 3000, false, '2025-04-10 00:00:00', 'Arranjos para altar e corredor', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (3, 5, 'Música para cerimônia', 'music', 1500, false, '2025-04-05 00:00:00', 'Quarteto de cordas', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (4, 5, 'Convites e papelaria', 'invitations', 800, true, '2025-01-20 00:00:00', '150 convites impressos', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (5, 6, 'DJ para festa', 'music', 1500, false, '2025-03-05 00:00:00', 'DJ com experiência em festas infantis', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (6, 6, 'Lembrancinhas', 'gifts', 600, true, '2025-02-15 00:00:00', '80 kits personalizados', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (7, 7, 'Credenciamento', 'admin', 1200, false, '2025-04-15 00:00:00', 'Sistema e material para 300 pessoas', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (8, 7, 'Alimentação palestrantes', 'catering', 800, false, '2025-04-25 00:00:00', 'Almoço e coffee break para 10 pessoas', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (9, 8, 'Decoração do salão', 'decoration', 3500, false, '2025-11-10 00:00:00', 'Decoração temática', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');
INSERT INTO public.budget_items VALUES (10, 9, 'Material didático', 'admin', 500, true, '2025-05-10 00:00:00', 'Apostilas e certificados', '2025-05-17 03:22:05.094468', '2025-05-17 03:22:05.094468');


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.documents VALUES (10, 'Teste Feed', 'Lorem ipsum dolor sit amet, consectetur adipiscing', 'Imagem', '/uploads/doc-1748445675637-20_de_mai__de_2025__12_37_53.png', 'image/png', '8650891', 5, '2025-05-28 15:21:17.295334', '2025-05-28 15:21:17.295334', '2025-05-28 15:21:17.295334');
INSERT INTO public.documents VALUES (11, 'Faltam 10 dias', 'Postar dia 16 Jun', 'Imagem', '/uploads/doc-1750106520628-Domine_o_Palco_Contagem_10_Dias.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:42:01.59048', '2025-06-16 20:42:01.59048', '2025-06-16 20:42:01.59048');
INSERT INTO public.documents VALUES (12, 'Faltam 8 dias', 'Postar dia 18 Jun', 'Imagem', '/uploads/doc-1750106546607-Domine_o_Palco_Contagem_8_Dias.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:42:26.864302', '2025-06-16 20:42:26.864302', '2025-06-16 20:42:26.864302');
INSERT INTO public.documents VALUES (13, 'Faltam 6 dias', 'Postar dia 20 Jun', 'Imagem', '/uploads/doc-1750106577412-Domine_o_Palco_Contagem_6_Dias.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:42:57.857527', '2025-06-16 20:42:57.857527', '2025-06-16 20:42:57.857527');
INSERT INTO public.documents VALUES (14, 'Faltam 4 dias', 'Postar dia 22 Jun', 'Imagem', '/uploads/doc-1750106600467-Domine_o_Palco_Contagem_4_Dias.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:43:20.704881', '2025-06-16 20:43:20.704881', '2025-06-16 20:43:20.704881');
INSERT INTO public.documents VALUES (15, 'Faltam 2 dias', 'Postar dia 24 Jun', 'Imagem', '/uploads/doc-1750106629138-Domine_o_Palco_Contagem_2_Dias.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:43:49.361155', '2025-06-16 20:43:49.361155', '2025-06-16 20:43:49.361155');
INSERT INTO public.documents VALUES (16, 'É amanha', 'Postar dia 25 Jun', 'Imagem', '/uploads/doc-1750106652373-Domine_o_Palco_Contagem_Amanha__.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:44:12.565957', '2025-06-16 20:44:12.565957', '2025-06-16 20:44:12.565957');
INSERT INTO public.documents VALUES (17, 'É hoje!', 'Postar no dia do evento, 26 Jun', 'Imagem', '/uploads/doc-1750106675343-Domine_o_Palco_Contagem_Hoje.jpg', 'image/jpeg', '8650891', 12, '2025-06-16 20:44:35.525033', '2025-06-16 20:44:35.525033', '2025-06-16 20:44:35.525033');


--
-- Data for Name: event_feedbacks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_feedbacks VALUES (1, 6, NULL, 0, '', false, NULL, '2025-05-31 02:04:51.876', 'feedback_6_1748657091787_p6f3do84em', NULL, true);
INSERT INTO public.event_feedbacks VALUES (5, 6, 'João Silva', 5, 'Evento excelente, muito bem organizado!', false, NULL, '2025-05-31 18:27:55.327765', 'feedback_6_1748657091787_p6f3do84em', 'joao@exemplo.com', false);
INSERT INTO public.event_feedbacks VALUES (6, 6, NULL, 4, 'Muito bom, só faltou mais música!', false, NULL, '2025-05-31 18:28:01.028996', 'feedback_6_1748657091787_p6f3do84em', NULL, true);
INSERT INTO public.event_feedbacks VALUES (7, 6, 'Maria Silva', 5, 'Evento incrível! Organização perfeita e tudo saiu como planejado. Parabéns!', false, NULL, '2025-05-31 18:32:43.702666', 'fb_1748716362983_1', 'maria@email.com', false);
INSERT INTO public.event_feedbacks VALUES (8, 6, NULL, 4, 'Festa muito boa, música excelente. Só achei que poderia ter mais variedade de comida.', false, NULL, '2025-05-31 18:32:43.843497', 'fb_1748716362983_2', NULL, true);
INSERT INTO public.event_feedbacks VALUES (9, 6, 'João Santos', 5, 'Perfeito! A decoração estava linda e a festa foi inesquecível. Muito obrigado!', false, NULL, '2025-05-31 18:32:43.910793', 'fb_1748716362983_3', 'joao@email.com', false);
INSERT INTO public.event_feedbacks VALUES (10, 6, NULL, 5, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', false, NULL, '2025-06-02 18:51:00.813272', 'feedback_6_1748657091787_p6f3do84em', NULL, true);


--
-- Data for Name: event_team_members; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_team_members VALUES (19, 5, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 05:37:44.412968');
INSERT INTO public.event_team_members VALUES (20, 6, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 05:37:44.412968');
INSERT INTO public.event_team_members VALUES (21, 7, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 05:37:44.412968');
INSERT INTO public.event_team_members VALUES (22, 8, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 05:37:44.412968');
INSERT INTO public.event_team_members VALUES (23, 9, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 05:37:44.412968');
INSERT INTO public.event_team_members VALUES (24, 8, 'user1', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-05-15 15:58:16.591893');
INSERT INTO public.event_team_members VALUES (25, 8, 'user2', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-05-15 15:58:16.591893');
INSERT INTO public.event_team_members VALUES (26, 8, 'user3', 'vendor', '{"canEdit": false, "canDelete": false, "canInvite": false}', '2025-05-15 15:58:16.591893');
INSERT INTO public.event_team_members VALUES (27, 7, 'user4', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 15:58:16.591893');
INSERT INTO public.event_team_members VALUES (28, 9, 'user1', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-05-15 15:58:28.677396');
INSERT INTO public.event_team_members VALUES (29, 5, 'user2', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-05-15 15:58:28.677396');
INSERT INTO public.event_team_members VALUES (30, 6, 'user3', 'vendor', '{"canEdit": false, "canDelete": false, "canInvite": false}', '2025-05-15 15:58:28.677396');
INSERT INTO public.event_team_members VALUES (31, 5, 'user4', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-15 15:58:28.677396');
INSERT INTO public.event_team_members VALUES (32, 10, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-17 15:38:32.299644');
INSERT INTO public.event_team_members VALUES (33, 10, '999001', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-05-22 20:04:04.855');
INSERT INTO public.event_team_members VALUES (34, 10, '999002', 'team_member', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-22 20:04:05.019');
INSERT INTO public.event_team_members VALUES (35, 10, '999003', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-05-22 20:04:05.161');
INSERT INTO public.event_team_members VALUES (36, 11, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-05-22 23:24:21.565103');
INSERT INTO public.event_team_members VALUES (39, 12, '8650891', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-06-05 21:30:58.331404');
INSERT INTO public.event_team_members VALUES (40, 12, 'local-1749855804892-kj0tmwymd', 'organizer', '{"canEdit": true, "canDelete": true, "canInvite": true}', '2025-06-13 23:03:25.070959');
INSERT INTO public.event_team_members VALUES (43, 9, 'user3', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-07-28 19:25:29.315596');
INSERT INTO public.event_team_members VALUES (44, 9, 'user4', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-07-28 19:25:29.400109');
INSERT INTO public.event_team_members VALUES (45, 12, 'user2', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-07-31 16:10:39.373898');
INSERT INTO public.event_team_members VALUES (46, 12, 'user3', 'team_member', '{"canEdit": true, "canDelete": false, "canInvite": false}', '2025-07-31 16:10:39.47519');


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.vendors VALUES (9, 'Buffet Elegância', 'Ana Pereira', 'ana@buffetelegancia.com.br', '(11) 98765-4321', 'catering', 18000, 'Pacote completo com entrada, prato principal e sobremesa para 150 pessoas', 5, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (10, 'Flores do Jardim', 'Roberto Flores', 'roberto@floresdojardim.com.br', '(11) 97654-3210', 'decoration', 8500, 'Decoração completa para cerimônia e recepção', 5, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (11, 'Ateliê de Noivas', 'Carla Souza', 'carla@ateliedenoivas.com.br', '(11) 96543-2109', 'costume', 7000, 'Vestido de noiva personalizado com ajustes', 5, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (12, 'DJ Marcos', 'Marcos Silva', 'marcos@djmarcos.com.br', '(11) 95432-1098', 'music', 3500, 'Pacote de 6 horas com equipamento completo', 5, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (13, 'Fotografias Eternas', 'Pedro Oliveira', 'pedro@fotografiaseternas.com.br', '(11) 94321-0987', 'photography', 5800, 'Ensaio pré-wedding + cobertura completa do evento', 5, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (14, 'Festas & Cia', 'Julia Mendes', 'julia@festasecia.com.br', '(11) 93210-9876', 'catering', 12000, 'Buffet completo para 80 adolescentes e 40 adultos', 6, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (15, 'Balões Mágicos', 'Ricardo Torres', 'ricardo@baloesmagicos.com.br', '(11) 92109-8765', 'decoration', 3800, 'Decoração temática com balões e painéis', 6, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (16, 'DJ Teen', 'Bruno Costa', 'bruno@djteen.com.br', '(11) 91098-7654', 'music', 2500, 'Especializado em festas para adolescentes com playlist personalizada', 6, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (17, 'Doces Sonhos Confeitaria', 'Marina Lima', 'marina@docessonhos.com.br', '(11) 90987-6543', 'cake', 1800, 'Bolo de 3 andares temático e mesa de doces', 6, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (18, 'Centro de Convenções Nacional', 'Carlos Rodrigues', 'carlos@centroconvencoes.com.br', '(11) 98765-1234', 'venue', 15000, 'Auditório principal com capacidade para 300 pessoas', 7, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (19, 'Tech Sound & Vision', 'Roberta Alves', 'roberta@techsound.com.br', '(11) 97654-2345', 'music', 8000, 'Equipamento audiovisual completo incluindo projetores e sistema de som', 7, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (20, 'Coffee Break Express', 'Thiago Santos', 'thiago@coffeebreak.com.br', '(11) 96543-3456', 'catering', 6500, '2 coffee breaks e 1 almoço para 300 participantes', 7, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (21, 'Crachás & Materiais', 'Fernanda Costa', 'fernanda@crachasemat.com.br', '(11) 95432-4567', 'invitation', 3000, 'Crachás, pastas e materiais personalizados', 7, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (22, 'Streaming Pro', 'Daniel Martins', 'daniel@streamingpro.com.br', '(11) 94321-5678', 'photography', 4500, 'Transmissão ao vivo e gravação do evento', 7, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (23, 'Espaço Coworking Central', 'Amanda Vieira', 'amanda@coworkingcentral.com.br', '(11) 93210-6789', 'venue', 2000, 'Sala de treinamento para 30 pessoas', 9, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (24, 'Café & Cia', 'Gustavo Lima', 'gustavo@cafeecia.com.br', '(11) 92109-7890', 'catering', 1500, 'Coffee break contínuo durante o workshop', 9, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (25, 'Gráfica Express', 'Camila Soares', 'camila@graficaexpress.com.br', '(11) 91098-8901', 'invitation', 800, 'Impressão de materiais didáticos e certificados', 9, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (26, 'Restaurante Le Bistro', 'Michel Durand', 'michel@lebistro.com.br', '(11) 90987-9012', 'venue', 10000, 'Salão VIP com jantar completo para 100 convidados', 8, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (27, 'Trio de Cordas Clássico', 'Clara Mendonça', 'clara@triodecordas.com.br', '(11) 98765-0123', 'music', 3500, 'Apresentação durante o coquetel e jantar', 8, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (28, 'Leilão Solidário', 'Roberto Santos', 'roberto@leilaosolidario.com.br', '(11) 97654-1234', 'other', 1500, 'Organização de leilão beneficente com mestre de cerimônias', 8, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');
INSERT INTO public.vendors VALUES (29, 'Convites Elegantes', 'Beatriz Silva', 'beatriz@conviteselegantes.com.br', '(11) 96543-2345', 'invitation', 2000, 'Convites impressos personalizados e lista de presença', 8, '2025-05-16 21:22:13.284849', '2025-05-16 21:22:13.284849');


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.expenses VALUES (1, 5, 'Pagamento fotógrafo', 'photography', 3500, true, '2025-03-15 00:00:00', NULL, NULL, 'Primeira parcela', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (2, 5, 'Buffet - entrada', 'catering', 5000, true, '2025-01-25 00:00:00', NULL, 9, 'Sinal para reserva da data', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (4, 5, 'Aluguel de cadeiras', 'decoration', 1200, false, '2025-04-10 00:00:00', NULL, NULL, '150 cadeiras Tiffany', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (5, 6, 'Bolo de aniversário', 'catering', 850, true, '2025-02-25 00:00:00', NULL, 14, 'Bolo para 50 pessoas', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (6, 6, 'Decoração com balões', 'decoration', 1200, false, '2025-03-01 00:00:00', NULL, NULL, 'Tema astronauta', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (7, 7, 'Aluguel do auditório', 'venue', 8500, true, '2025-01-15 00:00:00', NULL, 18, 'Inclui equipamento de som', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (8, 8, 'Reserva restaurante', 'venue', 5000, true, '2025-10-15 00:00:00', NULL, 26, 'Sinal para reserva do espaço', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (9, 8, 'Material gráfico', 'marketing', 1200, false, '2025-11-01 00:00:00', NULL, NULL, 'Convites e banners', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (10, 9, 'Aluguel sala workshop', 'venue', 1500, true, '2025-05-15 00:00:00', NULL, 23, 'Pagamento integral', '2025-05-17 03:20:02.249654', '2025-05-17 03:20:02.249654');
INSERT INTO public.expenses VALUES (3, 5, 'Buffet - parcela 2', 'catering', 8000, false, '2025-03-15 00:00:00', NULL, 9, 'Segunda parcela', '2025-05-17 03:20:02.249654', '2025-05-25 19:56:53.208');
INSERT INTO public.expenses VALUES (11, 12, 'Artes do Evento - Giulio', 'graphic_materials', -50000, true, '2025-06-04 00:00:00', '2025-06-01 00:00:00', NULL, 'Capa Sympla, Feed, Story, Contagem Regressiva, Banner A4', '2025-06-06 17:46:52.009899', '2025-06-11 16:38:21.506');
INSERT INTO public.expenses VALUES (12, 12, 'Impressão das artes A4 para divulgação', 'graphic_materials', -3810, true, '2025-06-05 00:00:00', '2025-06-05 00:00:00', NULL, '15 folhas', '2025-06-13 22:02:22.748057', '2025-06-13 22:02:22.748057');
INSERT INTO public.expenses VALUES (14, 12, 'Impulsionamento Vídeo Feed', 'marketing', -10421, true, '2025-06-14 00:00:00', '2025-06-14 00:00:00', NULL, '314 clicks no link do Sympla', '2025-06-16 21:36:25.294998', '2025-06-16 21:36:54.276');
INSERT INTO public.expenses VALUES (15, 12, 'Impulsionamento Carrossel Feed', 'marketing', -10172, true, '2025-06-14 00:00:00', '2025-06-14 00:00:00', NULL, '218 clicks no link do Sympla', '2025-06-16 21:37:43.506905', '2025-06-16 21:37:43.506905');
INSERT INTO public.expenses VALUES (16, 12, 'Patrocínio Buenas Carnes', 'sponsor', 50000, true, '2025-06-19 00:00:00', '2025-05-27 00:00:00', NULL, 'Pix', '2025-06-17 22:28:49.880845', '2025-06-17 22:28:49.880845');
INSERT INTO public.expenses VALUES (18, 12, 'Impressão das artes A4 para divulgação', 'graphic_materials', -3750, true, '2025-07-09 00:00:00', '2025-07-09 00:00:00', NULL, '15 folhas', '2025-07-14 20:36:25.006576', '2025-07-14 20:36:25.006576');
INSERT INTO public.expenses VALUES (13, 12, 'Flávia Lima', 'other', -80000, true, '2025-06-29 00:00:00', NULL, NULL, '3 dias de cachê', '2025-06-13 22:12:43.559714', '2025-08-05 15:23:32.881');


--
-- Data for Name: feedback_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.feedback_metrics VALUES (1, 'feedback_6_1748657091787_p6f3do84em', NULL, '2025-05-31 18:27:55.364', '127.0.0.1', 'curl/8.11.1', '2025-05-31 18:27:55.400893');
INSERT INTO public.feedback_metrics VALUES (2, 'feedback_6_1748657091787_p6f3do84em', NULL, '2025-05-31 18:28:01.06', '127.0.0.1', 'curl/8.11.1', '2025-05-31 18:28:01.096899');
INSERT INTO public.feedback_metrics VALUES (3, 'fb_1748716362983_1', '2025-05-29 18:32:43.941', '2025-05-29 18:32:43.941', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-05-31 18:32:43.977814');
INSERT INTO public.feedback_metrics VALUES (4, 'fb_1748716362983_2', '2025-05-30 18:32:43.941', '2025-05-30 18:32:43.941', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', '2025-05-31 18:32:44.049038');
INSERT INTO public.feedback_metrics VALUES (5, 'fb_1748716362983_3', '2025-05-31 06:32:43.941', '2025-05-31 06:32:43.941', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2025-05-31 18:32:44.115328');
INSERT INTO public.feedback_metrics VALUES (6, 'feedback_6_1748657091787_p6f3do84em', NULL, '2025-06-02 18:51:00.857', '10.82.6.66', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '2025-06-02 18:51:00.894884');


--
-- Data for Name: participants; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.participants VALUES (1, 5, 'Lucas Gabriel Teixeira', 'isabella48@azevedo.org', '0900 870 3811', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (2, 5, 'Sr. Leonardo Fogaça', 'psantos@aragao.com', '51 4781 4976', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (3, 5, 'João Pedro Carvalho', 'fernandesvitor-gabriel@uol.com.br', '0800 482 3192', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (4, 5, 'Raquel da Cruz', 'milena97@costa.net', '0500 063 7608', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (5, 5, 'Lavínia da Conceição', 'olima@gmail.com', '+55 31 6511-4066', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (6, 5, 'Amanda Castro', 'eduardodas-neves@rezende.br', '(051) 3319 2832', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (7, 5, 'Alícia Costa', 'ana-vitoria02@fernandes.com', '+55 81 1856 8179', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (8, 5, 'Ana Lívia Cardoso', 'luiz-otavio96@da.com', '+55 81 8839-4705', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (9, 5, 'Davi Lucca Monteiro', 'eribeiro@gmail.com', '+55 (051) 0812-0464', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (10, 5, 'Dra. Emanuella Cunha', 'diego26@freitas.com', '(061) 8161-1471', 'pending', 'imported', '2025-05-29 00:07:31.242945', '2025-05-29 00:07:31.242945');
INSERT INTO public.participants VALUES (11, 5, 'João Teste', 'joaoteste@gmail.com', '119999999999', 'pending', 'manual', '2025-05-29 01:09:34.678738', '2025-05-29 01:09:34.678738');


--
-- Data for Name: schedule_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.schedule_items VALUES (1, 9, 'Credenciamento', 'Registro e credenciamento dos participantes', '08:00', 'Recepção', 'Equipe de recepção', '2025-05-24 19:59:13.324909+00', '2025-05-24 19:59:13.324909+00', NULL);
INSERT INTO public.schedule_items VALUES (2, 9, 'Abertura', 'Cerimônia de abertura com apresentação da agenda', '09:00', 'Auditório principal', 'Diretor e Gerentes', '2025-05-24 19:59:13.324909+00', '2025-05-24 19:59:13.324909+00', NULL);
INSERT INTO public.schedule_items VALUES (3, 9, 'Palestra principal', 'Palestra com o convidado principal', '10:00', 'Auditório principal', 'Palestrante convidado', '2025-05-24 19:59:13.324909+00', '2025-05-24 19:59:13.324909+00', NULL);
INSERT INTO public.schedule_items VALUES (4, 9, 'Coffee break', 'Pausa para café e networking', '11:30', 'Área de convivência', 'Equipe de buffet', '2025-05-24 19:59:13.324909+00', '2025-05-24 19:59:13.324909+00', NULL);
INSERT INTO public.schedule_items VALUES (5, 9, 'Workshops paralelos', 'Sessões de workshops em salas separadas', '13:00', 'Salas de reunião', 'Facilitadores e palestrantes', '2025-05-24 19:59:13.324909+00', '2025-05-24 19:59:13.324909+00', NULL);
INSERT INTO public.schedule_items VALUES (6, 9, 'Encerramento', 'Encerramento e próximos passos', '16:30', 'Auditório principal', 'Diretor de Marketing', '2025-05-24 19:59:13.324909+00', '2025-05-24 19:59:13.324909+00', NULL);
INSERT INTO public.schedule_items VALUES (7, 10, 'Credenciamento', 'Registro e credenciamento dos participantes', '08:00', 'Recepção', 'Equipe de recepção', '2025-05-24 19:59:13.46798+00', '2025-05-24 19:59:13.46798+00', NULL);
INSERT INTO public.schedule_items VALUES (8, 10, 'Abertura', 'Cerimônia de abertura com apresentação da agenda', '09:00', 'Auditório principal', 'Diretor e Gerentes', '2025-05-24 19:59:13.46798+00', '2025-05-24 19:59:13.46798+00', NULL);
INSERT INTO public.schedule_items VALUES (9, 10, 'Palestra principal', 'Palestra com o convidado principal', '10:00', 'Auditório principal', 'Palestrante convidado', '2025-05-24 19:59:13.46798+00', '2025-05-24 19:59:13.46798+00', NULL);
INSERT INTO public.schedule_items VALUES (10, 10, 'Coffee break', 'Pausa para café e networking', '11:30', 'Área de convivência', 'Equipe de buffet', '2025-05-24 19:59:13.46798+00', '2025-05-24 19:59:13.46798+00', NULL);
INSERT INTO public.schedule_items VALUES (11, 10, 'Workshops paralelos', 'Sessões de workshops em salas separadas', '13:00', 'Salas de reunião', 'Facilitadores e palestrantes', '2025-05-24 19:59:13.46798+00', '2025-05-24 19:59:13.46798+00', NULL);
INSERT INTO public.schedule_items VALUES (12, 10, 'Encerramento', 'Encerramento e próximos passos', '16:30', 'Auditório principal', 'Diretor de Marketing', '2025-05-24 19:59:13.46798+00', '2025-05-24 19:59:13.46798+00', NULL);
INSERT INTO public.schedule_items VALUES (13, 11, 'Início do evento', 'Abertura oficial', '09:00', 'Entrada principal', 'Organizadores', '2025-05-24 19:59:13.599007+00', '2025-05-24 19:59:13.599007+00', NULL);
INSERT INTO public.schedule_items VALUES (14, 11, 'Atividade principal', 'Atividade central do evento', '10:30', 'Área principal', 'Equipe responsável', '2025-05-24 19:59:13.599007+00', '2025-05-24 19:59:13.599007+00', NULL);
INSERT INTO public.schedule_items VALUES (15, 11, 'Encerramento', 'Fechamento do evento', '16:00', 'Área principal', 'Organizadores', '2025-05-24 19:59:13.599007+00', '2025-05-24 19:59:13.599007+00', NULL);
INSERT INTO public.schedule_items VALUES (16, 7, 'Credenciamento', 'Credenciamento e entrega de material', '08:00', 'Recepção do Centro de Convenções', 'Equipe de recepção', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (17, 7, 'Abertura oficial', 'Cerimônia de abertura com autoridades', '09:30', 'Auditório principal', 'Comitê organizador', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (18, 7, 'Keynote de abertura', 'Palestra de abertura com especialista internacional', '10:00', 'Auditório principal', 'Palestrante internacional', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (19, 7, 'Sessões temáticas', 'Palestras em trilhas paralelas', '11:30', 'Salas temáticas', 'Palestrantes convidados', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (20, 7, 'Almoço', 'Almoço de networking', '13:00', 'Área de alimentação', 'Equipe de catering', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (21, 7, 'Painéis de discussão', 'Debate entre especialistas do setor', '14:30', 'Auditório principal', 'Moderadores e painelistas', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (22, 7, 'Encerramento', 'Cerimônia de encerramento e premiações', '17:30', 'Auditório principal', 'Comitê organizador', '2025-05-24 19:59:13.730117+00', '2025-05-24 19:59:13.730117+00', NULL);
INSERT INTO public.schedule_items VALUES (23, 8, 'Início do evento', 'Abertura oficial', '09:00', 'Entrada principal', 'Organizadores', '2025-05-24 19:59:13.866241+00', '2025-05-24 19:59:13.866241+00', NULL);
INSERT INTO public.schedule_items VALUES (24, 8, 'Atividade principal', 'Atividade central do evento', '10:30', 'Área principal', 'Equipe responsável', '2025-05-24 19:59:13.866241+00', '2025-05-24 19:59:13.866241+00', NULL);
INSERT INTO public.schedule_items VALUES (25, 8, 'Encerramento', 'Fechamento do evento', '16:00', 'Área principal', 'Organizadores', '2025-05-24 19:59:13.866241+00', '2025-05-24 19:59:13.866241+00', NULL);
INSERT INTO public.schedule_items VALUES (26, 6, 'Início do evento', 'Abertura oficial', '09:00', 'Entrada principal', 'Organizadores', '2025-05-24 19:59:13.999077+00', '2025-05-24 19:59:13.999077+00', NULL);
INSERT INTO public.schedule_items VALUES (27, 6, 'Atividade principal', 'Atividade central do evento', '10:30', 'Área principal', 'Equipe responsável', '2025-05-24 19:59:13.999077+00', '2025-05-24 19:59:13.999077+00', NULL);
INSERT INTO public.schedule_items VALUES (28, 6, 'Encerramento', 'Fechamento do evento', '16:00', 'Área principal', 'Organizadores', '2025-05-24 19:59:13.999077+00', '2025-05-24 19:59:13.999077+00', NULL);
INSERT INTO public.schedule_items VALUES (29, 5, 'Chegada dos convidados', 'Recepção dos convidados na entrada do local', '16:00', 'Entrada principal', 'Equipe de recepção', '2025-05-24 19:59:14.132059+00', '2025-05-24 19:59:14.132059+00', NULL);
INSERT INTO public.schedule_items VALUES (30, 5, 'Cerimônia', 'Cerimônia de casamento', '17:00', 'Altar principal', 'Cerimonialista, Noivos, Padrinhos', '2025-05-24 19:59:14.132059+00', '2025-05-24 19:59:14.132059+00', NULL);
INSERT INTO public.schedule_items VALUES (31, 5, 'Coquetel', 'Coquetel de boas-vindas', '18:00', 'Área externa', 'Equipe de buffet', '2025-05-24 19:59:14.132059+00', '2025-05-24 19:59:14.132059+00', NULL);
INSERT INTO public.schedule_items VALUES (32, 5, 'Jantar', 'Jantar dos convidados', '19:30', 'Salão principal', 'Equipe de buffet', '2025-05-24 19:59:14.132059+00', '2025-05-24 19:59:14.132059+00', NULL);
INSERT INTO public.schedule_items VALUES (33, 5, 'Festa', 'Início da festa com música', '21:00', 'Pista de dança', 'DJ e Banda', '2025-05-24 19:59:14.132059+00', '2025-05-24 19:59:14.132059+00', NULL);
INSERT INTO public.schedule_items VALUES (36, 12, 'Recepção', NULL, '18:00', 'Palco e Auditório', 'Equipe de Recepção', '2025-06-20 20:17:30.758997+00', '2025-06-20 20:17:30.758997+00', '2025-06-26 00:00:00');
INSERT INTO public.schedule_items VALUES (37, 12, 'Recepção dia 2', NULL, '10:00', 'Palco e Auditório', 'Equipe de Recepção', '2025-06-20 20:18:57.565384+00', '2025-06-20 20:18:57.565384+00', '2025-06-28 00:00:00');
INSERT INTO public.schedule_items VALUES (38, 12, 'Inicio Workshop', NULL, '18:30', 'Palco e Auditório', 'Flávia', '2025-06-21 17:10:23.67432+00', '2025-06-21 17:10:23.67432+00', '2025-06-26 00:00:00');


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tasks VALUES (20, 'Preparar decoração do local', 'Montar a decoração e o cenário de acordo com o tema da coleção

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-21 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-20 19:35:28.455317', '2025-05-22 20:04:11.957');
INSERT INTO public.tasks VALUES (21, 'Organizar peças da coleção', 'Garantir que todas as peças da coleção estejam prontas e organizadas

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-21 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-20 19:35:28.54836', '2025-05-22 20:04:12.237');
INSERT INTO public.tasks VALUES (22, 'Revisar checklist final', 'Revisar todos os preparativos e confirmar que tudo está pronto

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-16 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-20 19:35:28.622795', '2025-05-22 20:04:12.524');
INSERT INTO public.tasks VALUES (23, 'Definir conceito e tema da coleção', 'Finalizar o tema, paleta de cores e conceito geral da coleção primavera

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-26 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:55.768389', '2025-05-22 20:04:12.799');
INSERT INTO public.tasks VALUES (9, 'Contratar fotógrafo', 'Encontrar e contratar fotógrafo para o casamento

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-03-15 00:00:00', 'todo', 'high', 5, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:10.673');
INSERT INTO public.tasks VALUES (10, 'Reservar local', 'Visitar e reservar local para a cerimônia

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-01-30 00:00:00', 'completed', 'high', 5, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:10.763');
INSERT INTO public.tasks VALUES (11, 'Definir lista de convidados', 'Finalizar a lista completa de convidados

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-02-28 00:00:00', 'in_progress', 'medium', 5, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:10.832');
INSERT INTO public.tasks VALUES (12, 'Encomendar bolo', 'Escolher sabor e design do bolo de aniversário

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-03-01 00:00:00', 'todo', 'medium', 6, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:10.899');
INSERT INTO public.tasks VALUES (13, 'Contratar animador', 'Encontrar animador para a festa

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-03-10 00:00:00', 'todo', 'low', 6, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:10.966');
INSERT INTO public.tasks VALUES (14, 'Reservar equipamento audiovisual', 'Projetores, microfones e sistema de som para a conferência

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-08-01 00:00:00', 'todo', 'high', 7, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:11.033');
INSERT INTO public.tasks VALUES (15, 'Confirmar palestrantes', 'Finalizar agenda e confirmação de palestrantes

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-07-15 00:00:00', 'in_progress', 'high', 7, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:11.099');
INSERT INTO public.tasks VALUES (16, 'Criar lista de convidados', 'Compilar lista final de convidados para o jantar

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-10-30 00:00:00', 'in_progress', 'medium', 8, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:11.165');
INSERT INTO public.tasks VALUES (17, 'Contratar buffet', 'Definir menu e contratar serviço de buffet

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-10-15 00:00:00', 'todo', 'high', 8, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:11.231');
INSERT INTO public.tasks VALUES (18, 'Preparar material didático', 'Criar apresentações e apostilas

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-06-20 00:00:00', 'todo', 'high', 9, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:11.298');
INSERT INTO public.tasks VALUES (19, 'Divulgar evento', 'Criar campanha de marketing para o workshop

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-05-30 00:00:00', 'in_progress', 'medium', 9, '8650891', '2025-05-15 05:37:58.407361', '2025-05-20 15:16:11.365');
INSERT INTO public.tasks VALUES (24, 'Confirmar reserva do local', 'Confirmar todos os detalhes da reserva em Hotel Unique, São Paulo

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-31 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:55.850264', '2025-05-22 20:04:13.073');
INSERT INTO public.tasks VALUES (25, 'Visitar o local para planejamento', 'Verificar layout, estrutura elétrica, iluminação e espaços para desfile em Hotel Unique, São Paulo

**Colaboradores:** Lucas Pires (principal), João Silva, Maria Santos, Carlos Oliveira', '2025-05-29 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:55.91662', '2025-05-22 20:04:13.49');
INSERT INTO public.tasks VALUES (26, 'Desenvolver lista de convidados VIP', 'Preparar lista segmentada (imprensa, celebridades, influenciadores, compradores) para os 150 do evento

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-26 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:55.983013', '2025-05-22 20:04:13.777');
INSERT INTO public.tasks VALUES (27, 'Contratar equipe de recepção', 'Contratar equipe para recepção, credenciamento e atendimento aos 150 convidados

**Colaboradores:** Lucas Pires (principal), Carlos Oliveira', '2025-05-31 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:56.048748', '2025-05-22 20:04:14.055');
INSERT INTO public.tasks VALUES (28, 'Implementar sistema de credenciamento', 'Configurar sistema digital ou impresso para credenciamento eficiente dos convidados

**Colaboradores:** Lucas Pires (principal), Carlos Oliveira', '2025-06-05 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:56.115369', '2025-05-22 20:04:14.334');
INSERT INTO public.tasks VALUES (29, 'Contratar fotógrafo e videógrafo', 'Contratar profissionais para registro completo: backstage, desfile e relacionamento com convidados

**Colaboradores:** Lucas Pires (principal), Carlos Oliveira', '2025-05-26 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.182194', '2025-05-22 20:04:14.65');
INSERT INTO public.tasks VALUES (45, 'Briefing final com a equipe', 'Reunir toda a equipe para instruções finais e alinhamento', '2025-05-16 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:57.253528', '2025-05-21 18:56:57.253528');
INSERT INTO public.tasks VALUES (47, 'Compilar cobertura de mídia', 'Reunir publicações, fotos e vídeos do evento para relatório', '2025-05-22 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:57.388504', '2025-05-21 18:56:57.388504');
INSERT INTO public.tasks VALUES (48, 'Definir objetivos do evento', 'Estabelecer metas claras e mensuráveis para o evento', '2025-09-26 00:00:00', 'todo', 'high', 8, '8650891', '2025-05-21 19:13:18.970226', '2025-05-21 19:13:18.970226');
INSERT INTO public.tasks VALUES (49, 'Reservar local do evento', 'Pesquisar e reservar um local adequado para o evento', '2025-10-11 00:00:00', 'todo', 'high', 8, '8650891', '2025-05-21 19:13:19.068839', '2025-05-21 19:13:19.068839');
INSERT INTO public.tasks VALUES (50, 'Criar lista de convidados', 'Desenvolver lista completa de convidados e participantes', '2025-10-16 00:00:00', 'todo', 'medium', 8, '8650891', '2025-05-21 19:13:19.144451', '2025-05-21 19:13:19.144451');
INSERT INTO public.tasks VALUES (51, 'Contratar fornecedores', 'Contratar serviços de catering, áudio/visual e decoração', '2025-10-26 00:00:00', 'todo', 'high', 8, '8650891', '2025-05-21 19:13:19.222216', '2025-05-21 19:13:19.222216');
INSERT INTO public.tasks VALUES (52, 'Enviar convites', 'Criar e enviar convites para todos os participantes', '2025-10-31 00:00:00', 'todo', 'high', 8, '8650891', '2025-05-21 19:13:19.303767', '2025-05-21 19:13:19.303767');
INSERT INTO public.tasks VALUES (53, 'Preparar material promocional', 'Desenvolver materiais de marketing e promocionais', '2025-11-05 00:00:00', 'todo', 'medium', 8, '8650891', '2025-05-21 19:13:19.37547', '2025-05-21 19:13:19.37547');
INSERT INTO public.tasks VALUES (54, 'Confirmar presença dos convidados', 'Fazer follow-up com os convidados para confirmar presença', '2025-11-18 00:00:00', 'todo', 'medium', 8, '8650891', '2025-05-21 19:13:19.445875', '2025-05-21 19:13:19.445875');
INSERT INTO public.tasks VALUES (55, 'Revisar logística final', 'Revisar todos os detalhes logísticos e preparativos finais', '2025-11-23 00:00:00', 'todo', 'high', 8, '8650891', '2025-05-21 19:13:19.521687', '2025-05-21 19:13:19.521687');
INSERT INTO public.tasks VALUES (30, 'Definir equipe de modelos', 'Selecionar e contratar modelos para apresentação da coleção

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-29 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.250907', '2025-05-22 20:04:14.952');
INSERT INTO public.tasks VALUES (31, 'Planejar sequência do desfile', 'Organizar a ordem de apresentação das peças, música e coreografia

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-26 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:56.321309', '2025-05-22 20:04:15.26');
INSERT INTO public.tasks VALUES (32, 'Contratar serviço de buffet premium', 'Definir menu gourmet e contratar serviço de buffet e coquetel para 150 pessoas

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-06-10 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.387645', '2025-05-22 20:04:15.55');
INSERT INTO public.tasks VALUES (33, 'Planejar serviço de bar e bebidas', 'Selecionar vinhos, champagnes e drinks especiais para o evento

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-06-05 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:56.454122', '2025-05-22 20:04:15.855');
INSERT INTO public.tasks VALUES (34, 'Desenvolver estratégia de divulgação', 'Criar plano de comunicação para antes, durante e após o evento

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-31 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.520514', '2025-05-22 20:04:16.169');
INSERT INTO public.tasks VALUES (35, 'Preparar press kit e material de imprensa', 'Elaborar release, lookbook digital, fotos das peças e informações sobre a coleção

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-26 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.587339', '2025-05-22 20:04:16.44');
INSERT INTO public.tasks VALUES (36, 'Enviar convites personalizados', 'Enviar convites físicos ou digitais para todos os convidados

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-26 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.654355', '2025-05-22 20:04:16.761');
INSERT INTO public.tasks VALUES (37, 'Configurar espaço para mídia', 'Preparar área para entrevistas, backdrop para fotos e espaço dedicado para imprensa

**Colaboradores:** Lucas Pires (principal), Carlos Oliveira', '2025-05-24 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:56.720638', '2025-05-22 20:04:17.054');
INSERT INTO public.tasks VALUES (38, 'Realizar ensaio geral', 'Conduzir ensaio completo com modelos, música, iluminação e toda a equipe

**Colaboradores:** Lucas Pires (principal), Carlos Oliveira', '2025-05-23 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.786835', '2025-05-22 20:04:17.347');
INSERT INTO public.tasks VALUES (39, 'Confirmar presença dos convidados VIP', 'Fazer follow-up final com convidados prioritários

**Colaboradores:** Lucas Pires (principal), Maria Santos', '2025-05-22 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:56.853698', '2025-05-22 20:04:17.696');
INSERT INTO public.tasks VALUES (40, 'Montar a decoração e cenografia', 'Implementar decoração, iluminação e cenário alinhados ao tema da coleção

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-22 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.921278', '2025-05-22 20:04:18.005');
INSERT INTO public.tasks VALUES (41, 'Preparar área de backstage', 'Organizar espaço para modelos, maquiagem, cabelo e peças da coleção

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-22 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:56.988259', '2025-05-22 20:04:18.291');
INSERT INTO public.tasks VALUES (42, 'Organizar peças da coleção', 'Finalizar organização do acervo, etiquetagem e sequência de apresentação

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-22 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:57.054547', '2025-05-22 20:04:18.575');
INSERT INTO public.tasks VALUES (43, 'Preparar press kits físicos', 'Montar kits de imprensa para distribuição no dia do evento

**Colaboradores:** Lucas Pires (principal), João Silva', '2025-05-22 00:00:00', 'todo', 'medium', 10, '8650891', '2025-05-21 18:56:57.121029', '2025-05-22 20:04:18.859');
INSERT INTO public.tasks VALUES (44, 'Testar equipamentos técnicos', 'Verificar som, iluminação, projeções e todos os equipamentos técnicos

**Colaboradores:** Lucas Pires (principal), Carlos Oliveira', '2025-05-16 00:00:00', 'todo', 'high', 10, '8650891', '2025-05-21 18:56:57.187257', '2025-05-22 20:04:19.365');
INSERT INTO public.tasks VALUES (56, 'Definir objetivos do evento', 'Estabelecer metas claras e mensuráveis para o evento', '2025-05-27 00:00:00', 'todo', 'high', 11, '8650891', '2025-05-22 23:24:21.641107', '2025-05-22 23:24:21.641107');
INSERT INTO public.tasks VALUES (57, 'Reservar local do evento', 'Pesquisar e reservar um local adequado para o evento', '2025-05-30 00:00:00', 'todo', 'high', 11, '8650891', '2025-05-22 23:24:21.717213', '2025-05-22 23:24:21.717213');
INSERT INTO public.tasks VALUES (58, 'Criar lista de convidados', 'Desenvolver lista completa de convidados e participantes', '2025-05-27 00:00:00', 'todo', 'medium', 11, '8650891', '2025-05-22 23:24:21.80191', '2025-05-22 23:24:21.80191');
INSERT INTO public.tasks VALUES (59, 'Contratar fornecedores', 'Contratar serviços de catering, áudio/visual e decoração', '2025-06-01 00:00:00', 'todo', 'high', 11, '8650891', '2025-05-22 23:24:21.873598', '2025-05-22 23:24:21.873598');
INSERT INTO public.tasks VALUES (60, 'Enviar convites', 'Criar e enviar convites para todos os participantes', '2025-05-27 00:00:00', 'todo', 'high', 11, '8650891', '2025-05-22 23:24:21.947391', '2025-05-22 23:24:21.947391');
INSERT INTO public.tasks VALUES (61, 'Preparar material promocional', 'Desenvolver materiais de marketing e promocionais', '2025-05-30 00:00:00', 'todo', 'medium', 11, '8650891', '2025-05-22 23:24:22.018175', '2025-05-22 23:24:22.018175');
INSERT INTO public.tasks VALUES (62, 'Confirmar presença dos convidados', 'Fazer follow-up com os convidados para confirmar presença', '2025-05-25 00:00:00', 'todo', 'medium', 11, '8650891', '2025-05-22 23:24:22.09361', '2025-05-22 23:24:22.09361');
INSERT INTO public.tasks VALUES (63, 'Revisar logística final', 'Revisar todos os detalhes logísticos e preparativos finais', '2025-05-29 00:00:00', 'todo', 'high', 11, '8650891', '2025-05-22 23:24:22.170474', '2025-05-22 23:24:22.170474');
INSERT INTO public.tasks VALUES (46, 'Enviar agradecimentos aos convidados', 'Enviar mensagens de agradecimento e material digital sobre a coleção', '2025-05-19 00:00:00', 'todo', 'medium', 10, '999002', '2025-05-21 18:56:57.321372', '2025-05-23 22:18:01.557');
INSERT INTO public.tasks VALUES (64, 'Definir objetivo e formato do evento', 'Estabelecer propósito, estrutura e experiência desejada para os participantes', '2025-06-08 00:00:00', 'todo', 'high', 12, '8650891', '2025-06-05 21:34:55.804262', '2025-06-05 21:34:55.804262');
INSERT INTO public.tasks VALUES (65, 'Preparar conteúdo e material didático', 'Desenvolver apostilas, apresentações e exercícios práticos para o workshop', '2025-06-10 00:00:00', 'todo', 'high', 12, '8650891', '2025-06-05 21:34:55.971766', '2025-06-05 21:34:55.971766');
INSERT INTO public.tasks VALUES (66, 'Testar equipamentos e materiais', 'Verificar som, projeção e todos os materiais necessários para as atividades', '2025-06-19 00:00:00', 'todo', 'high', 12, '8650891', '2025-06-05 21:34:56.106129', '2025-06-05 21:34:56.106129');
INSERT INTO public.tasks VALUES (67, 'Confirmar reserva e preparar o espaço', 'Finalizar detalhes com Santo Rolê e planejar layout do ambiente', '2025-06-11 00:00:00', 'todo', 'high', 12, '8650891', '2025-06-05 21:34:56.241819', '2025-06-05 21:34:56.241819');
INSERT INTO public.tasks VALUES (68, 'Criar e enviar convites', 'Desenvolver convites atrativos e enviar para os 100 participantes', '2025-06-12 00:00:00', 'todo', 'high', 12, '8650891', '2025-06-05 21:34:56.375589', '2025-06-05 21:34:56.375589');
INSERT INTO public.tasks VALUES (69, 'Criar estratégia de divulgação', 'Planejar posts nas redes sociais e materiais promocionais', '2025-06-15 00:00:00', 'todo', 'medium', 12, '8650891', '2025-06-05 21:34:56.508709', '2025-06-05 21:34:56.508709');
INSERT INTO public.tasks VALUES (70, 'Organizar alimentação e bebidas', 'Providenciar coffee break, lanches ou refeições para os participantes', '2025-06-16 00:00:00', 'todo', 'medium', 12, '8650891', '2025-06-05 21:34:56.641083', '2025-06-05 21:34:56.641083');
INSERT INTO public.tasks VALUES (71, 'Organizar equipe de apoio', 'Definir recepção, controle de acesso e suporte durante o evento', '2025-06-16 00:00:00', 'todo', 'medium', 12, '8650891', '2025-06-05 21:34:56.776469', '2025-06-05 21:34:56.776469');
INSERT INTO public.tasks VALUES (72, 'Confirmar presença dos participantes', 'Fazer follow-up final e organizar lista de confirmados', '2025-06-21 00:00:00', 'todo', 'medium', 12, '8650891', '2025-06-05 21:34:56.90858', '2025-06-05 21:34:56.90858');
INSERT INTO public.tasks VALUES (73, 'Preparar kit e materiais do dia', 'Organizar crachás, materiais impressos e tudo que será distribuído', '2025-06-25 00:00:00', 'todo', 'high', 12, '8650891', '2025-06-05 21:34:57.04137', '2025-06-05 21:34:57.04137');
INSERT INTO public.tasks VALUES (74, 'Coletar feedback dos participantes', 'Enviar formulário de avaliação e reunir sugestões para futuros eventos', '2025-06-28 00:00:00', 'todo', 'medium', 12, '8650891', '2025-06-05 21:34:57.173288', '2025-06-05 21:34:57.173288');


--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.task_assignees VALUES (1, 9, '8650891', '2025-05-22 19:44:35.769');
INSERT INTO public.task_assignees VALUES (2, 10, '8650891', '2025-05-22 19:44:36.055');
INSERT INTO public.task_assignees VALUES (3, 11, '8650891', '2025-05-22 19:44:36.321');
INSERT INTO public.task_assignees VALUES (4, 12, '8650891', '2025-05-22 19:44:36.534');
INSERT INTO public.task_assignees VALUES (5, 13, '8650891', '2025-05-22 19:44:36.732');
INSERT INTO public.task_assignees VALUES (6, 14, '8650891', '2025-05-22 19:44:36.996');
INSERT INTO public.task_assignees VALUES (7, 15, '8650891', '2025-05-22 19:44:37.193');
INSERT INTO public.task_assignees VALUES (10, 16, '8650891', '2025-05-22 19:44:38.305');
INSERT INTO public.task_assignees VALUES (11, 17, '8650891', '2025-05-22 19:44:38.451');
INSERT INTO public.task_assignees VALUES (14, 18, '8650891', '2025-05-22 19:44:39.7');
INSERT INTO public.task_assignees VALUES (15, 19, '8650891', '2025-05-22 19:44:39.85');
INSERT INTO public.task_assignees VALUES (27, 9, '999001', '2025-05-22 19:46:15.435');
INSERT INTO public.task_assignees VALUES (28, 9, '999002', '2025-05-22 19:46:15.605');
INSERT INTO public.task_assignees VALUES (29, 9, '999003', '2025-05-22 19:46:15.753');
INSERT INTO public.task_assignees VALUES (30, 10, '999001', '2025-05-22 19:46:15.979');
INSERT INTO public.task_assignees VALUES (31, 10, '999002', '2025-05-22 19:46:16.114');
INSERT INTO public.task_assignees VALUES (32, 10, '999003', '2025-05-22 19:46:16.262');
INSERT INTO public.task_assignees VALUES (33, 11, '999001', '2025-05-22 19:46:16.472');
INSERT INTO public.task_assignees VALUES (34, 11, '999002', '2025-05-22 19:46:16.613');
INSERT INTO public.task_assignees VALUES (35, 11, '999003', '2025-05-22 19:46:16.753');
INSERT INTO public.task_assignees VALUES (36, 12, '999001', '2025-05-22 19:46:16.955');
INSERT INTO public.task_assignees VALUES (37, 12, '999002', '2025-05-22 19:46:17.114');
INSERT INTO public.task_assignees VALUES (38, 12, '999003', '2025-05-22 19:46:17.266');
INSERT INTO public.task_assignees VALUES (39, 13, '999001', '2025-05-22 19:46:17.475');
INSERT INTO public.task_assignees VALUES (40, 13, '999002', '2025-05-22 19:46:17.658');
INSERT INTO public.task_assignees VALUES (41, 13, '999003', '2025-05-22 19:46:17.81');
INSERT INTO public.task_assignees VALUES (42, 14, '999001', '2025-05-22 19:46:18.023');
INSERT INTO public.task_assignees VALUES (43, 14, '999002', '2025-05-22 19:46:18.159');
INSERT INTO public.task_assignees VALUES (44, 14, '999003', '2025-05-22 19:46:18.309');
INSERT INTO public.task_assignees VALUES (45, 15, '999001', '2025-05-22 19:46:18.537');
INSERT INTO public.task_assignees VALUES (46, 15, '999002', '2025-05-22 19:46:18.694');
INSERT INTO public.task_assignees VALUES (47, 15, '999003', '2025-05-22 19:46:18.833');
INSERT INTO public.task_assignees VALUES (48, 16, '999001', '2025-05-22 19:46:19.04');
INSERT INTO public.task_assignees VALUES (49, 16, '999002', '2025-05-22 19:46:19.178');
INSERT INTO public.task_assignees VALUES (50, 16, '999003', '2025-05-22 19:46:19.317');
INSERT INTO public.task_assignees VALUES (51, 17, '999001', '2025-05-22 19:46:19.529');
INSERT INTO public.task_assignees VALUES (52, 17, '999002', '2025-05-22 19:46:19.666');
INSERT INTO public.task_assignees VALUES (53, 17, '999003', '2025-05-22 19:46:19.806');
INSERT INTO public.task_assignees VALUES (54, 18, '999001', '2025-05-22 19:46:20.019');
INSERT INTO public.task_assignees VALUES (55, 18, '999002', '2025-05-22 19:46:20.168');
INSERT INTO public.task_assignees VALUES (56, 18, '999003', '2025-05-22 19:46:20.306');
INSERT INTO public.task_assignees VALUES (57, 19, '999001', '2025-05-22 19:46:20.508');
INSERT INTO public.task_assignees VALUES (58, 19, '999002', '2025-05-22 19:46:20.65');
INSERT INTO public.task_assignees VALUES (59, 19, '999003', '2025-05-22 19:46:20.794');
INSERT INTO public.task_assignees VALUES (61, 20, '8650891', '2025-05-22 20:04:11.807');
INSERT INTO public.task_assignees VALUES (62, 20, '999001', '2025-05-22 20:04:11.888');
INSERT INTO public.task_assignees VALUES (63, 21, '8650891', '2025-05-22 20:04:12.097');
INSERT INTO public.task_assignees VALUES (64, 21, '999001', '2025-05-22 20:04:12.166');
INSERT INTO public.task_assignees VALUES (65, 22, '8650891', '2025-05-22 20:04:12.382');
INSERT INTO public.task_assignees VALUES (66, 22, '999002', '2025-05-22 20:04:12.45');
INSERT INTO public.task_assignees VALUES (67, 23, '8650891', '2025-05-22 20:04:12.661');
INSERT INTO public.task_assignees VALUES (68, 23, '999001', '2025-05-22 20:04:12.731');
INSERT INTO public.task_assignees VALUES (69, 24, '8650891', '2025-05-22 20:04:12.934');
INSERT INTO public.task_assignees VALUES (70, 24, '999002', '2025-05-22 20:04:13.001');
INSERT INTO public.task_assignees VALUES (71, 25, '8650891', '2025-05-22 20:04:13.211');
INSERT INTO public.task_assignees VALUES (72, 25, '999001', '2025-05-22 20:04:13.28');
INSERT INTO public.task_assignees VALUES (73, 25, '999002', '2025-05-22 20:04:13.351');
INSERT INTO public.task_assignees VALUES (74, 25, '999003', '2025-05-22 20:04:13.422');
INSERT INTO public.task_assignees VALUES (75, 26, '8650891', '2025-05-22 20:04:13.632');
INSERT INTO public.task_assignees VALUES (76, 26, '999002', '2025-05-22 20:04:13.704');
INSERT INTO public.task_assignees VALUES (77, 27, '8650891', '2025-05-22 20:04:13.915');
INSERT INTO public.task_assignees VALUES (78, 27, '999003', '2025-05-22 20:04:13.988');
INSERT INTO public.task_assignees VALUES (79, 28, '8650891', '2025-05-22 20:04:14.188');
INSERT INTO public.task_assignees VALUES (80, 28, '999003', '2025-05-22 20:04:14.258');
INSERT INTO public.task_assignees VALUES (81, 29, '8650891', '2025-05-22 20:04:14.483');
INSERT INTO public.task_assignees VALUES (82, 29, '999003', '2025-05-22 20:04:14.559');
INSERT INTO public.task_assignees VALUES (83, 30, '8650891', '2025-05-22 20:04:14.805');
INSERT INTO public.task_assignees VALUES (84, 30, '999001', '2025-05-22 20:04:14.875');
INSERT INTO public.task_assignees VALUES (85, 31, '8650891', '2025-05-22 20:04:15.124');
INSERT INTO public.task_assignees VALUES (86, 31, '999001', '2025-05-22 20:04:15.191');
INSERT INTO public.task_assignees VALUES (87, 32, '8650891', '2025-05-22 20:04:15.405');
INSERT INTO public.task_assignees VALUES (88, 32, '999001', '2025-05-22 20:04:15.472');
INSERT INTO public.task_assignees VALUES (89, 33, '8650891', '2025-05-22 20:04:15.71');
INSERT INTO public.task_assignees VALUES (90, 33, '999001', '2025-05-22 20:04:15.785');
INSERT INTO public.task_assignees VALUES (91, 34, '8650891', '2025-05-22 20:04:16.019');
INSERT INTO public.task_assignees VALUES (92, 34, '999002', '2025-05-22 20:04:16.095');
INSERT INTO public.task_assignees VALUES (93, 35, '8650891', '2025-05-22 20:04:16.302');
INSERT INTO public.task_assignees VALUES (94, 35, '999002', '2025-05-22 20:04:16.373');
INSERT INTO public.task_assignees VALUES (95, 36, '8650891', '2025-05-22 20:04:16.588');
INSERT INTO public.task_assignees VALUES (96, 36, '999002', '2025-05-22 20:04:16.682');
INSERT INTO public.task_assignees VALUES (97, 37, '8650891', '2025-05-22 20:04:16.907');
INSERT INTO public.task_assignees VALUES (98, 37, '999003', '2025-05-22 20:04:16.982');
INSERT INTO public.task_assignees VALUES (99, 38, '8650891', '2025-05-22 20:04:17.204');
INSERT INTO public.task_assignees VALUES (100, 38, '999003', '2025-05-22 20:04:17.279');
INSERT INTO public.task_assignees VALUES (101, 39, '8650891', '2025-05-22 20:04:17.56');
INSERT INTO public.task_assignees VALUES (102, 39, '999002', '2025-05-22 20:04:17.628');
INSERT INTO public.task_assignees VALUES (103, 40, '8650891', '2025-05-22 20:04:17.857');
INSERT INTO public.task_assignees VALUES (104, 40, '999001', '2025-05-22 20:04:17.925');
INSERT INTO public.task_assignees VALUES (105, 41, '8650891', '2025-05-22 20:04:18.151');
INSERT INTO public.task_assignees VALUES (106, 41, '999001', '2025-05-22 20:04:18.222');
INSERT INTO public.task_assignees VALUES (107, 42, '8650891', '2025-05-22 20:04:18.434');
INSERT INTO public.task_assignees VALUES (108, 42, '999001', '2025-05-22 20:04:18.504');
INSERT INTO public.task_assignees VALUES (109, 43, '8650891', '2025-05-22 20:04:18.722');
INSERT INTO public.task_assignees VALUES (110, 43, '999001', '2025-05-22 20:04:18.791');
INSERT INTO public.task_assignees VALUES (111, 44, '8650891', '2025-05-22 20:04:18.999');
INSERT INTO public.task_assignees VALUES (112, 44, '999003', '2025-05-22 20:04:19.29');
INSERT INTO public.task_assignees VALUES (113, 45, '8650891', '2025-05-22 20:04:19.501');
INSERT INTO public.task_assignees VALUES (114, 45, '999001', '2025-05-22 20:04:19.58');
INSERT INTO public.task_assignees VALUES (115, 46, '999002', '2025-05-23 22:18:01.670313');
INSERT INTO public.task_assignees VALUES (116, 46, '999003', '2025-05-23 22:18:01.670565');
INSERT INTO public.task_assignees VALUES (117, 64, '8650891', '2025-06-05 21:34:55.888259');
INSERT INTO public.task_assignees VALUES (118, 65, '8650891', '2025-06-05 21:34:56.038316');
INSERT INTO public.task_assignees VALUES (119, 66, '8650891', '2025-06-05 21:34:56.172529');
INSERT INTO public.task_assignees VALUES (120, 67, '8650891', '2025-06-05 21:34:56.308804');
INSERT INTO public.task_assignees VALUES (121, 68, '8650891', '2025-06-05 21:34:56.441723');
INSERT INTO public.task_assignees VALUES (122, 69, '8650891', '2025-06-05 21:34:56.574758');
INSERT INTO public.task_assignees VALUES (123, 70, '8650891', '2025-06-05 21:34:56.710283');
INSERT INTO public.task_assignees VALUES (124, 71, '8650891', '2025-06-05 21:34:56.842378');
INSERT INTO public.task_assignees VALUES (125, 72, '8650891', '2025-06-05 21:34:56.974366');
INSERT INTO public.task_assignees VALUES (126, 73, '8650891', '2025-06-05 21:34:57.107081');
INSERT INTO public.task_assignees VALUES (127, 74, '8650891', '2025-06-05 21:34:57.239793');


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 130, true);


--
-- Name: budget_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budget_items_id_seq', 10, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 18, true);


--
-- Name: event_feedbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_feedbacks_id_seq', 10, true);


--
-- Name: event_team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_team_members_id_seq', 48, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 13, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expenses_id_seq', 18, true);


--
-- Name: feedback_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feedback_metrics_id_seq', 6, true);


--
-- Name: participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.participants_id_seq', 11, true);


--
-- Name: schedule_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schedule_items_id_seq', 38, true);


--
-- Name: task_assignees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.task_assignees_id_seq', 127, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 74, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendors_id_seq', 29, true);


--
-- PostgreSQL database dump complete
--

\unrestrict YeTzTVqMZQDtO8HrBeLzPgA8dhVOxIKLd4Eo0PIVph2pPxKpSctKnPhJONYzSlh


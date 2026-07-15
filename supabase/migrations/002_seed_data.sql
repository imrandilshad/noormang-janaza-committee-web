-- ============================================================
-- Seed Data: 20 Sample Members for Janaza Committee Portal
-- ============================================================
-- Run AFTER 001_initial_schema.sql

-- Insert sample families first
INSERT INTO families (family_name, village, address) VALUES
  ('Ahmad Family',   'Noor Mang', 'House #1, Main Street, Noor Mang'),
  ('Khan Family',    'Noor Mang', 'House #5, Mosque Road, Noor Mang'),
  ('Ali Family',     'Noor Mang', 'House #12, Village Road, Noor Mang'),
  ('Butt Family',    'Noor Mang', 'House #8, School Lane, Noor Mang'),
  ('Hussain Family', 'Noor Mang', 'House #15, Market Road, Noor Mang'),
  ('Malik Family',   'Noor Mang', 'House #22, East Street, Noor Mang'),
  ('Sheikh Family',  'Noor Mang', 'House #31, West Road, Noor Mang')
ON CONFLICT DO NOTHING;

-- Insert 20 sample members
INSERT INTO members (member_number, full_name, father_name, phone, cnic, occupation, status, joined_date, family_id)
SELECT
  m.member_number,
  m.full_name,
  m.father_name,
  m.phone,
  m.cnic,
  m.occupation,
  m.status::member_status,
  m.joined_date::DATE,
  f.id
FROM (VALUES
  ('JC-001', 'Muhammad Akram',        'Muhammad Ashraf',   '03001234501', '35202-1234501-1', 'Farmer',       'active', '2018-01-15', 'Ahmad Family'),
  ('JC-002', 'Abdul Qadir',           'Ghulam Hussain',    '03001234502', '35202-1234502-3', 'Shopkeeper',   'active', '2018-02-10', 'Khan Family'),
  ('JC-003', 'Muhammad Tariq',        'Malik Bashir',      '03001234503', '35202-1234503-5', 'Farmer',       'active', '2018-03-05', 'Ali Family'),
  ('JC-004', 'Riaz Hussain',          'Ameer Hussain',     '03001234504', '35202-1234504-7', 'Driver',       'active', '2018-04-20', 'Butt Family'),
  ('JC-005', 'Shahid Iqbal',          'Muhammad Iqbal',    '03001234505', '35202-1234505-9', 'Teacher',      'active', '2018-05-12', 'Hussain Family'),
  ('JC-006', 'Manzoor Ahmad',         'Nazar Ahmad',       '03001234506', '35202-1234506-1', 'Laborer',      'active', '2018-06-01', 'Malik Family'),
  ('JC-007', 'Imtiaz Ahmed',          'Bashir Ahmed',      '03001234507', '35202-1234507-3', 'Carpenter',    'active', '2018-07-18', 'Sheikh Family'),
  ('JC-008', 'Ghulam Mustafa',        'Ghulam Rasool',     '03001234508', '35202-1234508-5', 'Tailor',       'active', '2018-08-09', 'Ahmad Family'),
  ('JC-009', 'Aslam Khan',            'Haji Khan',         '03001234509', '35202-1234509-7', 'Electrician',  'active', '2019-01-05', 'Khan Family'),
  ('JC-010', 'Muhammad Nawaz',        'Sardar Nawaz',      '03001234510', '35202-1234510-9', 'Plumber',      'active', '2019-02-14', 'Ali Family'),
  ('JC-011', 'Sajid Mehmood',         'Mehmood Ahmad',     '03001234511', '35202-1234511-1', 'Mechanic',     'active', '2019-03-21', 'Butt Family'),
  ('JC-012', 'Zafar Iqbal',           'Iqbal Hussain',     '03001234512', '35202-1234512-3', 'Farmer',       'active', '2019-04-08', 'Hussain Family'),
  ('JC-013', 'Asif Mahmood',          'Hafeez Mahmood',    '03001234513', '35202-1234513-5', 'Shopkeeper',   'active', '2019-05-30', 'Malik Family'),
  ('JC-014', 'Muhammad Rafiq',        'Haji Rafiq',        '03001234514', '35202-1234514-7', 'Driver',       'active', '2019-06-15', 'Sheikh Family'),
  ('JC-015', 'Tahir Mahmood',         'Muhammad Saleem',   '03001234515', '35202-1234515-9', 'Government',   'active', '2019-07-22', 'Ahmad Family'),
  ('JC-016', 'Naveed Ahmad',          'Anwar Ahmad',       '03001234516', '35202-1234516-1', 'Farmer',       'active', '2020-01-10', 'Khan Family'),
  ('JC-017', 'Waseem Akram',          'Akram Hussain',     '03001234517', '35202-1234517-3', 'Laborer',      'active', '2020-03-05', 'Ali Family'),
  ('JC-018', 'Irfan Saeed',           'Muhammad Saeed',    '03001234518', '35202-1234518-5', 'Teacher',      'active', '2020-05-17', 'Butt Family'),
  ('JC-019', 'Bilal Hussain',         'Abid Hussain',      '03001234519', '35202-1234519-7', 'Shopkeeper',   'active', '2020-08-12', 'Hussain Family'),
  ('JC-020', 'Kashif Mehmood',        'Bashir Mehmood',    '03001234520', '35202-1234520-9', 'Farmer',       'active', '2021-01-01', 'Malik Family')
) AS m(member_number, full_name, father_name, phone, cnic, occupation, status, joined_date, family_name)
JOIN families f ON f.family_name = m.family_name
ON CONFLICT (member_number) DO NOTHING;

-- Insert a sample funeral case
INSERT INTO funeral_cases (case_number, deceased_name, date_of_death, date_of_funeral, location, contact_person, contact_phone, status)
VALUES
  ('FC-2024-001', 'Muhammad Ashraf', '2024-01-10', '2024-01-10', 'Noor Mang Village Graveyard', 'Muhammad Akram', '03001234501', 'closed'),
  ('FC-2024-002', 'Ghulam Hussain',  '2024-03-22', '2024-03-22', 'Noor Mang Village Graveyard', 'Abdul Qadir',    '03001234502', 'closed'),
  ('FC-2025-001', 'Ameer Hussain',   '2025-06-01', '2025-06-01', 'Noor Mang Village Graveyard', 'Riaz Hussain',   '03001234504', 'open')
ON CONFLICT DO NOTHING;

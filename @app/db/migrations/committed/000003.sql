--! Previous: sha1:ca60e3d130fae5162e8ba249369dc663edb5bcf4
--! Hash: sha1:275b5bc8c52d5ddd9d44982e3c6aac07004ab634

-- Enter migration here
--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Ubuntu 12.3-1.pgdg18.04+1)
-- Dumped by pg_dump version 12.3 (Ubuntu 12.3-1.pgdg18.04+1)


--
-- Name: _history_event; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public._history_event;

CREATE TYPE app_public._history_event AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE'
);




--
-- Name: accounts_state; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.accounts_state;

CREATE TYPE app_public.accounts_state AS ENUM (
    'active',
    'new',
    'passive'
);




--
-- Name: bank_transfers_tracking_status; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.bank_transfers_tracking_status;

CREATE TYPE app_public.bank_transfers_tracking_status AS ENUM (
    'neu',
    'exportiert',
    'ausgeführt',
    'nicht ausgeführt',
    'rücklastschrift',
    'vorschau'
);




--
-- Name: contacts_gender; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.contacts_gender;

CREATE TYPE app_public.contacts_gender AS ENUM (
    '',
    'F',
    'M'
);




--
-- Name: contacts_state; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.contacts_state;

CREATE TYPE app_public.contacts_state AS ENUM (
    'active',
    'passive',
    'blocked'
);





--
-- Name: deals_cycle; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.deals_cycle;

CREATE TYPE app_public.deals_cycle AS ENUM (
    'monthly',
    'quarterly',
    'semiannual',
    'annual',
    'once'
);




--
-- Name: deals_entry_day; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.deals_entry_day;

CREATE TYPE app_public.deals_entry_day AS ENUM (
    '',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30'
);




--
-- Name: deals_pay_method; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.deals_pay_method;

CREATE TYPE app_public.deals_pay_method AS ENUM (
    'bill',
    'debit'
);




--
-- Name: deals_start_day; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.deals_start_day;

CREATE TYPE app_public.deals_start_day AS ENUM (
    '1',
    '15'
);




--
-- Name: deals_status; Type: TYPE; Schema: app_public; Owner: crm_
--

DROP TYPE IF EXISTS app_public.deals_status;

CREATE TYPE app_public.deals_status AS ENUM (
    'active',
    'passive'
);


--
-- Name: contacts; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.contacts;

CREATE TABLE app_public.contacts (
    id uuid primary key default gen_random_uuid(),
    mandator uuid NOT NULL,
    creation_date timestamptz not null default now(),
    state text DEFAULT 'contact'::text,
    use_email boolean DEFAULT false,
    company_name text DEFAULT ''::text,
    co_field text DEFAULT ''::text,
    phone_code text DEFAULT 49,
    phone_number text DEFAULT ''::text,
    fax text DEFAULT ''::text,
    title text DEFAULT ''::text,
    title_pro text DEFAULT ''::text,
    first_name text DEFAULT ''::text,
    last_name text DEFAULT ''::text,
    address text DEFAULT ''::text,
    address_2 text DEFAULT ''::text,
    city text DEFAULT ''::text,
    postal_code text DEFAULT ''::text,
    country_code text DEFAULT ''::text,
    gender text DEFAULT ''::text,
    date_of_birth date,
    mobile text DEFAULT ''::text,
    email text DEFAULT ''::text,
    comments text DEFAULT ''::text,
    edited_by uuid NOT NULL,
    merged bigint[],
    last_locktime timestamptz not null default now(),
    owner uuid
);
alter table app_public.contacts enable row level security;



--
-- Name: COLUMN contacts.title_pro; Type: COMMENT; Schema: app_public; Owner: crm_
--

COMMENT ON COLUMN app_public.contacts.title_pro IS 'professional title';


--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: app_public; Owner: crm_
--


--
-- Name: accounts; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.accounts;

CREATE TABLE app_public.accounts (
    id uuid not null default gen_random_uuid() primary key,
    contact uuid NOT NULL,
    bank_name text NOT NULL,
    bic text DEFAULT ''::text,
    account text DEFAULT ''::text,
    blz text DEFAULT ''::text,
    iban text NOT NULL,
    creditor uuid NOT NULL,
    sign_date date,
    state app_public.accounts_state DEFAULT 'new'::app_public.accounts_state,
    creation_date timestamptz not null default now(),
    edited_by uuid NOT NULL,
    last_locktime timestamptz not null default now()
);
alter table app_public.accounts enable row level security;




--
-- Name: activity; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.activity;

CREATE TABLE app_public.activity (
    id uuid not null default gen_random_uuid() primary key,
    result text,
    request text NOT NULL,
    user_id uuid NOT NULL,
    created_At timestamptz not null default now()
);
alter table app_public.activity enable row level security;



--
-- Name: COLUMN activity.request; Type: COMMENT; Schema: app_public; Owner: crm_
--

COMMENT ON COLUMN app_public.activity.request IS 'DbQuery';


--
-- Name: bank_transfers; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.bank_transfers;

CREATE TABLE app_public.bank_transfers (
    ag_name text NOT NULL,
    ag_konto_or_iban text NOT NULL,
    ag_blz_or_bic text NOT NULL,
    zahlpfl_name text NOT NULL,
    zahlpfl_name2 text,
    zahlpfl_strasse text NOT NULL,
    zahlpfl_name_ort text NOT NULL,
    zahlpfl_name_kto_or_iban text NOT NULL,
    zahlpfl_name_blz_or_bic text,
    betrag double precision,
    currency text DEFAULT '€'::text,
    zahlart text DEFAULT 'BASIS'::text NOT NULL,
    termin date NOT NULL,
    vwz1 text DEFAULT ''::text,
    vwz2 text DEFAULT ''::text,
    vwz3 text DEFAULT ''::text,
    vwz4 text DEFAULT ''::text,
    vwz5 text DEFAULT ''::text,
    vwz6 text DEFAULT ''::text,
    vwz7 text DEFAULT ''::text,
    vwz8 text DEFAULT ''::text,
    vwz9 text DEFAULT ''::text,
    ba_id uuid not null default gen_random_uuid() primary key,
    tracking_status app_public.bank_transfers_tracking_status DEFAULT 'neu'::app_public.bank_transfers_tracking_status NOT NULL,
    anforderungs_datum date NOT NULL,
    rueck_datum date,
    cycle text NOT NULL,
    ref_id text NOT NULL,
    mandat_id text NOT NULL,
    mandat_datum date NOT NULL,
    ag_creditor_id text NOT NULL,
    sequenz text NOT NULL,
    super_ag_name text NOT NULL
);
alter table app_public.bank_transfers enable row level security;


--
-- Name: deals; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.deals;

CREATE TABLE app_public.deals (
    id uuid not null default gen_random_uuid() primary key,
    contact uuid NOT NULL,
    creation_date timestamptz not null default now(),
    account uuid,
    target_account uuid NOT NULL,
    start_day text DEFAULT '1'::text,
    start_date date,
    cycle app_public.deals_cycle NOT NULL,
    amount numeric(10,2) NOT NULL,
    product uuid NOT NULL,
    agent uuid,
    project uuid,
    status text DEFAULT 'active'::text,
    pay_method text DEFAULT 'debit'::text,
    end_date date,
    end_reason uuid,
    repeat_date date,
    edited_by uuid NOT NULL,
    mandator uuid,
    old_active boolean,
    cycle_start_date date,
    last_locktime timestamptz not null default now()
);
alter table app_public.deals enable row level security;




--
-- Name: end_reasons; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.end_reasons;

CREATE TABLE app_public.end_reasons (
    id uuid,
    reason text NOT NULL,
    edited_by uuid NOT NULL,
    mandator uuid NOT NULL
);





--
-- Name: mandators; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.mandators;

CREATE TABLE app_public.mandators (
    id uuid not null default gen_random_uuid() primary key,
    contact uuid NOT NULL,
    name text NOT NULL,
    description text,
    info jsonb DEFAULT '{}'::jsonb,
    edited_by uuid NOT NULL,
    parent uuid,
    last_locktime timestamptz not null default now()
);




--
-- Name: products; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.products;

CREATE TABLE app_public.products (
    id uuid not null default gen_random_uuid() primary key,
    name text NOT NULL,
    description text,
    value numeric(10,2),
    attributes jsonb DEFAULT '{}'::jsonb,
    mandator uuid NOT NULL,
    active boolean,
    edited_by uuid NOT NULL
);
alter table app_public.products enable row level security;


--
-- Name: projects; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.projects;

CREATE TABLE app_public.projects (
    id uuid not null default gen_random_uuid() primary key,
    mandator uuid NOT NULL,
    name text NOT NULL,
    description text,
    edited_by uuid NOT NULL,
    provision_percent double precision DEFAULT (0.0)::double precision,
    cancellation_liable integer DEFAULT 0,
    target_account uuid NOT NULL
);
alter table app_public.projects enable row level security;


DROP TABLE IF EXISTS app_public.roles;

CREATE TABLE app_public.roles (
    id uuid not null default gen_random_uuid() primary key,
    name text NOT NULL,
    description text DEFAULT ''::text,
    permissions jsonb DEFAULT '{"users": [], "groups": [], "routes": []}'::jsonb NOT NULL,
    edited_by uuid NOT NULL,
    mandator uuid NOT NULL
);



--
-- Name: statements; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.statements;

CREATE TABLE app_public.statements (
    a text,
    b text,
    c date NOT NULL,
    d date NOT NULL,
    e double precision NOT NULL,
    f text,
    g text,
    h text,
    i text,
    j text,
    k text,
    l text,
    m text,
    n text,
    o text,
    p text,
    q text,
    r text,
    s text,
    t text,
    u text,
    v text,
    w text,
    x text,
    y text,
    z text,
    aa text,
    processed boolean DEFAULT false NOT NULL,
    kid uuid not null default gen_random_uuid() primary key,
    edited_by uuid NOT NULL,
    mandator uuid
);
alter table app_public.statements enable row level security;


--
-- Name: user_groups; Type: TABLE; Schema: app_public; Owner: crm_
--

DROP TABLE IF EXISTS app_public.user_groups;

CREATE TABLE app_public.user_groups (
    id uuid not null default gen_random_uuid() primary key,
    name text NOT NULL,
    description text,
    can jsonb DEFAULT '{}'::jsonb,
    mandator uuid NOT NULL,
    edited_by uuid NOT NULL
);
alter table app_public.user_groups enable row level security;




--
-- Name: accounts audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.accounts CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.accounts FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: activity audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.activity CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.activity FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: bank_transfers audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.bank_transfers CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.bank_transfers FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: contacts audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.contacts CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.contacts FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: deals audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.deals CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.deals FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: end_reasons audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.end_reasons CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.end_reasons FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: mandators audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.mandators CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.mandators FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: products audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.products CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.products FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: projects audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.projects CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.projects FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: roles audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.roles CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.roles FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: statements audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.statements CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.statements FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: user_groups audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.user_groups CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.user_groups FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: users audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_row ON app_public.users CASCADE;

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.users FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: accounts audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.accounts CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.accounts FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: activity audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.activity CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.activity FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: bank_transfers audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.bank_transfers CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.bank_transfers FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: contacts audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.contacts CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.contacts FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: deals audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.deals CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.deals FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: end_reasons audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.end_reasons CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.end_reasons FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: mandators audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.mandators CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.mandators FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: products audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.products CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.products FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: projects audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.projects CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.projects FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: roles audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.roles CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.roles FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: statements audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.statements CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.statements FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: user_groups audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.user_groups CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.user_groups FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: users audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: crm_
--

DROP TRIGGER IF EXISTS audit_trigger_stm ON app_public.users CASCADE;

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.users FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');

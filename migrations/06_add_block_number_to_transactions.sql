ALTER TABLE transactions 
ADD block_number BIGINT NOT NULL DEFAULT 0;

ALTER TABLE transactions 
ADD position INTEGER NOT NULL DEFAULT 0;

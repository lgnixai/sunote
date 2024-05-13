DEFINE TABLE chat SCHEMAFULL;

DEFINE FIELD created ON chat TYPE datetime VALUE $before OR time::now();
DEFINE FIELD name ON chat TYPE string;
DEFINE FIELD model ON chat TYPE any;
DEFINE INDEX index_name ON TABLE chat COLUMNS name UNIQUE;

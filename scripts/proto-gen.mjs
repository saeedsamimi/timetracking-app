import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const PROTO_DIR = resolve('src/protos');
const OUT_DIR = resolve('src/protos/generated');
const PLUGIN = resolve(
  'node_modules',
  '.bin',
  process.platform === 'win32'
    ? 'protoc-gen-ts_proto.cmd'
    : 'protoc-gen-ts_proto',
);

const protoFiles = readdirSync(PROTO_DIR)
  .filter((f) => f.endsWith('.proto'))
  .map((f) => join(PROTO_DIR, f));

if (protoFiles.length === 0) {
  console.error(`No .proto files found in ${PROTO_DIR}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const args = [
  `--plugin=protoc-gen-ts_proto=${PLUGIN}`,
  `--ts_proto_out=${OUT_DIR}`,
  '--ts_proto_opt=nestJs=true,outputServices=grpc-js,useDate=string,fileSuffix=.pb',
  '-I',
  PROTO_DIR,
  ...protoFiles,
];

execFileSync('grpc_tools_node_protoc', args, { stdio: 'inherit' });
console.log(
  `Generated types for ${protoFiles.length} proto file(s) into ${OUT_DIR}`,
);

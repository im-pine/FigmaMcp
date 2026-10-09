// 통합 테스트는 .env.test(테스트 전용 DB)만 읽는다. 개발 DB로 잘못 연결되지 않게 DB 이름을 확인한다.
import { config } from "dotenv";

config({ path: ".env.test", override: true, quiet: true });
if (!process.env.DATABASE_URL?.includes("_test")) {
  throw new Error("통합 테스트는 테스트 전용 DB(이름에 _test)에서만 실행합니다. .env.test를 확인하세요.");
}

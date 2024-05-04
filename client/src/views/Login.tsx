import imports from "../utils/imports";
import { defineComponent } from "vue";
import { BoxAnimation } from "../components/Animations";
import {
  Form,
  FormInput,
  FormButton,
  FormParagraph,
} from "../components/ui/Form";
import { validateUsername, validatePassword } from "../utils/auth/validator";

const Login = defineComponent({
  name: "Login",
  setup() {
    const { store, router, route, reactive, watchEffect, postReq } = imports();

    const state = reactive({
      errorStatus: 200,
      buttonActive: false,
      username: route.query.username ?? "",
      password: route.query.password ?? "",
    });

    watchEffect(() => {
      const isValue =
        validateUsername(state.username as string) &&
        validatePassword(state.password as string);

      state.buttonActive = isValue;
    });

    const onLogin = () => {
      store._isProgress = 40;
      postReq("/login", {
        username: state.username,
        password: state.password,
      })
        .then((res) => {
          store._isProgress = 100;
          store.getters._getUser = res.data.user_data;
          store._isLogin = true;
          router.push((route.query.redirectUrl as string) ?? "/");
          localStorage.setItem(
            "user_data",
            JSON.stringify({
              access_token: res.data.user_data.access_token,
              ...JSON.parse(localStorage.user_data ?? null),
            })
          );
        })
        .catch((err) => {
          store._isProgress = 100;
          state.errorStatus = err.response.status;
          setTimeout(() => (state.errorStatus = 200), 5000);
        });
    };

    return { route, state, onLogin };
  },
  render() {
    return (
      <div v-motion-slide-visible-once-right>
        <BoxAnimation class="fixed" />
        <div class="flex justify-center items-center h-dvh w-dvw">
          <Form
            class="md:h-[450px]"
            top={
              <>
                <FormInput
                  errorActive={this.state.errorStatus == 404}
                  onInput-change={(item) => (this.state.username = item)}
                  type="text"
                  label={this.$t("LoginForm.Input.username")}
                />
                <FormInput
                  errorActive={this.state.errorStatus == 401}
                  onInput-change={(item) => (this.state.password = item)}
                  type="password"
                  label={this.$t("LoginForm.Input.password")}
                />
              </>
            }
            bottom={
              <>
                <FormButton
                  class="hover:w-40 lg:hover:w-[105px] mb-5"
                  label={this.$t("LoginForm.Button.login")}
                  active={this.state.buttonActive}
                  click={this.onLogin}
                  icon={
                    <svg
                      class="w-[32px] h-[32px] text-grey-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L13 6M19 12L13 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  }
                />
                <FormParagraph
                  click={() => this.$router.push("/recovery")}
                  label={this.$t("LoginForm.Button.recovery")}
                />
                <FormParagraph
                  label={this.$t("LoginForm.Button.signup")}
                  click={() =>
                    this.$router.push({
                      path: "/signup",
                      query: {
                        redirectUrl: this.route.query.redirectUrl ?? "/",
                      },
                    })
                  }
                />
              </>
            }
            label={this.$t("LoginForm.title")}
          />
        </div>
      </div>
    );
  },
});

export default Login;
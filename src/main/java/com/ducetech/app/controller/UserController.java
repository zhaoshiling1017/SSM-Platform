package com.ducetech.app.controller;


import com.ducetech.app.model.User;
import com.ducetech.app.service.UserService;
import com.ducetech.framework.controller.BaseController;
import com.ducetech.util.CookieUtil;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.support.RedirectAttributesModelMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@Controller
public class UserController extends BaseController {
	protected Logger log = LoggerFactory.getLogger(getClass());
	
	@Autowired
	private UserService userService;

	@RequestMapping(value = "/login", method = RequestMethod.GET)
	public String loginPage(HttpServletRequest request , Model model) {
		if(request.getSession().getAttribute("DT_LOGIN_NAME")!=null){
			return "redirect:/";
		}
		String tag = request.getParameter("tag");
		if ("sessionInvalid".equals(tag)) {
			model.addAttribute("tag", "sessionInvalid");
		}
		return "login";
	}

	@RequestMapping(value = "/logout", method = RequestMethod.GET)
	public String logoutPage(HttpServletRequest request, HttpServletResponse response) {
		SecurityUtils.getSubject().logout();
		return "redirect:/";
	}

	@RequestMapping(value = "/login", method = RequestMethod.POST)
	public String login(HttpServletRequest request, HttpServletResponse response, RedirectAttributesModelMap modelMap) {
		String loginName = request.getParameter("username");
		String password = request.getParameter("password");
		Subject subject = SecurityUtils.getSubject();
		UsernamePasswordToken token = new UsernamePasswordToken(loginName,password);
		if (StringUtils.isNotEmpty(loginName) && StringUtils.isNotEmpty(password)) {
			try{
				subject.login(token);	
				User user = (User)subject.getPrincipal();
				log.info("{}:{} login.", loginName, user.getName());
				subject.getSession().setAttribute("DT_LOGIN_USER", user);
				CookieUtil.setCookie(response, "", user.getUserId());
			}catch(Exception ex){
				//ex.printStackTrace();
				modelMap.addFlashAttribute("message", "账号或密码错误");
				return "redirect:/login";
			}
		}
		return "redirect:/";
	} 

	@RequestMapping(value = "/user/info", method = RequestMethod.GET)
	public String findUser(HttpServletRequest request, Model model) {
		User user = getLoginUser(request);
		model.addAttribute("user", user);
		return "user/user-info";
	}
	
	@RequestMapping(value = "/user/info", method = RequestMethod.POST)
	public String editUser(@ModelAttribute("form") User user, HttpServletRequest request, Model model) {
		String name = user.getName();
		
		User userInfo = getLoginUser(request);
		userInfo.setName(name);
		
//		userService.editUserInfo(userInfo);
		model.addAttribute("msg", "success");
		model.addAttribute("user", userInfo);
		return "user/user-info";
	}

	@RequestMapping(value = "/user/password", method = RequestMethod.GET)
	public String password(Model model) {
		return "/user/password";
	}

//	@RequestMapping(value = "/user/password", method = RequestMethod.POST)
//	public void changePassword(@ModelAttribute("form") User user, HttpServletRequest request, HttpServletResponse response) throws IOException {
//		response.setContentType("application/json");
//		String password = user.getPassword();
//		String newPassword = user.getPassword();
//		if (StringUtils.isNotEmpty(password) && StringUtils.isNotEmpty(newPassword)) {
//			User userInfo = getLoginUser(request);
//			if (Encrypt.md5(password).equals(userInfo.getPassword())) {
//				userInfo.setPassword(Encrypt.md5(newPassword, userInfo.getSecretKey()));
////				userService.setPassword(userInfo);
//				response.getWriter().write("{\"success\":\"修改成功\"}");
//			}else{
//				response.getWriter().write("{\"warning\":\"原密码错误\"}");
//			}
//		}
//	}
}
